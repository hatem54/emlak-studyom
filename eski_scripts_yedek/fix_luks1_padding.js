const fs = require('fs');
let txt = fs.readFileSync('tpl_luks/luks.js', 'utf8');

const t1 = 'height:${scaleY(400)}px;padding:${scaleY(40)}px ${scaleX(60)}px;box-sizing:border-box;display:flex;flex-direction:column;background:#112244;\\"><div style=\\"display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:${scaleY(30)}px;border-bottom:2px solid rgba(212, 175, 55, 0.3);padding-bottom:${scaleY(20)}px;\\">';

const t2 = 'height:${scaleY(400)}px;padding:${scaleY(20)}px ${scaleX(60)}px ${scaleY(30)}px ${scaleX(60)}px;box-sizing:border-box;display:flex;flex-direction:column;background:#112244;\\"><div style=\\"display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:${scaleY(20)}px;border-bottom:2px solid rgba(212, 175, 55, 0.3);padding-bottom:${scaleY(10)}px;\\">';

if(txt.includes(t1)) {
    txt = txt.replace(t1, t2);
    fs.writeFileSync('tpl_luks/luks.js', txt);
    console.log('Replaced successfully');
} else {
    console.log('Target not found');
}
