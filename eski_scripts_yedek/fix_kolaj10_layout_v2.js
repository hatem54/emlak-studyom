const fs = require('fs');
let c = fs.readFileSync('tpl_kolaj/kolaj.js', 'utf8');

const oldFunc = `function _kolaj10(){
    var c = _kolajCanvas(); if(!c) return;
    var w = _kolajWrapper('#1a1a2e','#16213e');
    w.innerHTML = 
        _foto(1, 0, 0, 100, 100, {radius:'0', border:'none'})+
        // Overlay
        '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(180deg,rgba(26,26,46,0.3) 0%,rgba(26,26,46,0.9) 100%);pointer-events:none;z-index:1;"></div>'+
        _yazi(3, 3, 60, 8,
            '<div style="font-size:53px;font-weight:900;letter-spacing:8px;color:#c0c0c0;">'+_b('aciklama','EMLAK')+'</div>', {padding:'0', extra:'z-index:2;'})+
        _yazi(63, 3, 34, 8,
            '<div style="text-align:right;font-size:25px;letter-spacing:4px;opacity:0.7;color:#c0c0c0;margin-top:10px;">'+_b('altBaslik','EDITION №1')+'</div>', {padding:'0', extra:'z-index:2;'})+
        _foto(2, 81, 10, 16, 18, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _foto(3, 81, 31, 16, 18, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _foto(4, 81, 52, 16, 18, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _foto(5, 3, 56, 16, 18, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _foto(6, 21, 56, 16, 18, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _foto(7, 39, 56, 16, 18, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _yazi(3, 76, 76, 24,
            '<div style="color:#fff;">'+
            '<div style="font-size:26px;letter-spacing:6px;color:#c0c0c0;">'+_b('altBaslik','EXCLUSIVE COVER')+'</div>'+
            '<div style="font-size:75px;font-weight:900;line-height:1.1;">'+_b('baslik','Elmas Rezidans')+'</div>'+
            '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:10px;border-top:1px solid #c0c0c0;padding-top:10px;">'+
            '<div style="font-size:30px;opacity:0.8;">'+_b('ozellik1','5+2')+' • '+_b('ozellik2','400 m²')+' • '+_b('ozellik3','Havuzlu')+'</div>'+
            '<div style="font-size:56px;font-weight:900;color:#c0c0c0;">'+_b('fiyat','55.000.000 TL')+'</div></div></div>', {padding:'0', extra:'z-index:2;'});
    c.appendChild(w);
}`;

const newFunc = `function _kolaj10(){
    var c = _kolajCanvas(); if(!c) return;
    var w = _kolajWrapper('#1a1a2e','#16213e');
    w.innerHTML = 
        _foto(1, 0, 0, 100, 100, {radius:'0', border:'none'})+
        // Overlay
        '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(180deg,rgba(26,26,46,0.3) 0%,rgba(26,26,46,0.9) 100%);pointer-events:none;z-index:1;"></div>'+
        _yazi(3, 3, 50, 8,
            '<div style="text-align:left;font-size:30px;letter-spacing:4px;opacity:0.8;color:#c0c0c0;margin-top:10px;">'+_b('altBaslik','MERKEZİ KONUM')+'</div>', {padding:'0', extra:'z-index:2;'})+
        _foto(2, 77, 8, 20, 21, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _foto(3, 77, 31, 20, 21, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _foto(4, 77, 54, 20, 21, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _foto(5, 3, 54, 20, 21, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _foto(6, 25, 54, 20, 21, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _foto(7, 47, 54, 20, 21, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _yazi(3, 76, 72, 24,
            '<div style="color:#fff;">'+
            '<div style="font-size:26px;letter-spacing:6px;color:#c0c0c0;">'+_b('altBaslik','EXCLUSIVE COVER')+'</div>'+
            '<div style="font-size:75px;font-weight:900;line-height:1.1;">'+_b('baslik','Elmas Rezidans')+'</div>'+
            '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:10px;border-top:1px solid #c0c0c0;padding-top:10px;">'+
            '<div style="font-size:30px;opacity:0.8;">'+_b('ozellik1','5+2')+' • '+_b('ozellik2','400 m²')+' • '+_b('ozellik3','Havuzlu')+'</div>'+
            '<div style="font-size:56px;font-weight:900;color:#c0c0c0;">'+_b('fiyat','55.000.000 TL')+'</div></div></div>', {padding:'0', extra:'z-index:2;'});
    c.appendChild(w);
}`;

if(c.includes(oldFunc)) {
    c = c.replace(oldFunc, newFunc);
    fs.writeFileSync('tpl_kolaj/kolaj.js', c);
    console.log('Successfully updated Kolaj 10 layout again');
} else {
    console.log('ERROR: Could not match exact string. Falling back to regex replacement.');
    // Fallback: replace everything between function _kolaj10(){ and c.appendChild(w);\n}
    const regex = /function _kolaj10\(\)\{[\s\S]*?c\.appendChild\(w\);\n\}/;
    if(regex.test(c)) {
        c = c.replace(regex, newFunc);
        fs.writeFileSync('tpl_kolaj/kolaj.js', c);
        console.log('Successfully updated Kolaj 10 layout using regex fallback');
    } else {
        console.log('FAILED');
    }
}
