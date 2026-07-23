const fs = require('fs');
let c = fs.readFileSync('tpl_kolaj/kolaj.js', 'utf8');

const oldFunc = `function _kolaj2(){
    var c = _kolajCanvas(); if(!c) return;
    var w = _kolajWrapper('#000','#1a1a1a');
    w.innerHTML = 
        _yazi(5, 3, 90, 12,
            '<div style="text-align:center;">'+
            '<div style="font-size:72px;font-weight:900;color:#d4af37;">'+_b('baslik','SATILIK LÜKS DAİRE')+'</div>'+
            '<div style="font-size:32px;opacity:0.7;letter-spacing:5px;margin-top:5px;color:#fff;">'+_b('altBaslik','MERKEZİ KONUM')+'</div></div>')+
        _foto(1, 5, 17, 90, 45, {radius:'12px', border:'2px dashed #d4af37'})+
        _foto(2, 5, 64, 21.5, 20, {radius:'8px', border:'2px dashed #d4af37'})+
        _foto(3, 28, 64, 21.5, 20, {radius:'8px', border:'2px dashed #d4af37'})+
        _foto(4, 51, 64, 21.5, 20, {radius:'8px', border:'2px dashed #d4af37'})+
        _foto(5, 74, 64, 21, 20, {radius:'8px', border:'2px dashed #d4af37'})+
        _yazi(5, 86, 90, 12,
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;background:#d4af37;padding:15px;border-radius:8px;color:#000;height:100%;box-sizing:border-box;">'+
            '<div style="text-align:center;"><div style="font-size:15px;opacity:0.7;font-weight:900;">FİYAT</div><div style="font-size:42px;font-weight:900;">'+_b('fiyat','15.000 TL')+'</div></div>'+
            '<div style="text-align:center;border-left:1px solid rgba(0,0,0,0.3);border-right:1px solid rgba(0,0,0,0.3);"><div style="font-size:15px;opacity:0.7;font-weight:900;">ALAN</div><div style="font-size:42px;font-weight:900;">'+_b('ozellik2','120 m²')+'</div></div>'+
            '<div style="text-align:center;"><div style="font-size:15px;opacity:0.7;font-weight:900;">TELEFON</div><div style="font-size:35px;font-weight:900;">'+_b('telefon','0532 000 00 00')+'</div></div>'+
            '</div>', {padding:'0'});
    c.appendChild(w);
}`;

const newFunc = `function _kolaj2(){
    var c = _kolajCanvas(); if(!c) return;
    var w = _kolajWrapper('#000','#1a1a1a');
    w.innerHTML = 
        _yazi(5, 3, 90, 14,
            '<div style="text-align:center;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100%;">'+
            '<div style="font-size:72px;font-weight:900;color:#d4af37;line-height:1.1;">'+_b('baslik','SATILIK LÜKS DAİRE')+'</div>'+
            '<div style="font-size:32px;opacity:0.7;letter-spacing:5px;margin-top:2px;color:#fff;line-height:1.1;">'+_b('altBaslik','MERKEZİ KONUM')+'</div></div>')+
        _foto(1, 5, 17, 90, 45, {radius:'12px', border:'2px dashed #d4af37'})+
        _foto(2, 5, 64, 21.5, 20, {radius:'8px', border:'2px dashed #d4af37'})+
        _foto(3, 28, 64, 21.5, 20, {radius:'8px', border:'2px dashed #d4af37'})+
        _foto(4, 51, 64, 21.5, 20, {radius:'8px', border:'2px dashed #d4af37'})+
        _foto(5, 74, 64, 21, 20, {radius:'8px', border:'2px dashed #d4af37'})+
        _yazi(5, 86, 90, 12,
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;background:#d4af37;border-radius:8px;color:#000;height:100%;box-sizing:border-box;align-content:center;align-items:center;padding:10px;">'+
            '<div style="text-align:center;display:flex;flex-direction:column;justify-content:center;line-height:1.1;"><div style="font-size:16px;opacity:0.8;font-weight:900;margin-bottom:4px;">FİYAT</div><div style="font-size:42px;font-weight:900;">'+_b('fiyat','15.000 TL')+'</div></div>'+
            '<div style="text-align:center;display:flex;flex-direction:column;justify-content:center;line-height:1.1;border-left:2px solid rgba(0,0,0,0.2);border-right:2px solid rgba(0,0,0,0.2);"><div style="font-size:16px;opacity:0.8;font-weight:900;margin-bottom:4px;">ALAN</div><div style="font-size:42px;font-weight:900;">'+_b('ozellik2','120 m²')+'</div></div>'+
            '<div style="text-align:center;display:flex;flex-direction:column;justify-content:center;line-height:1.1;"><div style="font-size:16px;opacity:0.8;font-weight:900;margin-bottom:4px;">TELEFON</div><div style="font-size:35px;font-weight:900;">'+_b('telefon','0532 000 00 00')+'</div></div>'+
            '</div>', {padding:'0'});
    c.appendChild(w);
}`;

if(c.includes(oldFunc)) {
    c = c.replace(oldFunc, newFunc);
    fs.writeFileSync('tpl_kolaj/kolaj.js', c);
    console.log('Successfully updated Kolaj 2 (Modern Daire) layout');
} else {
    console.log('ERROR: Could not match exact string. Falling back to regex replacement.');
    const regex = /function _kolaj2\(\)\{[\s\S]*?c\.appendChild\(w\);\n\}/;
    if(regex.test(c)) {
        c = c.replace(regex, newFunc);
        fs.writeFileSync('tpl_kolaj/kolaj.js', c);
        console.log('Successfully updated Kolaj 2 layout using regex fallback');
    } else {
        console.log('FAILED');
    }
}
