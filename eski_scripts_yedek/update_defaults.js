const fs = require('fs');

let l = fs.readFileSync('tpl_luks/luks.js', 'utf8');
l = l.replace('value="SATILIK MÜSTAKİL EV"', 'value="SATILIK EV"');
l = l.replace(/<textarea id="canvaLFeats" rows="\d+">[\s\S]*?<\/textarea>/, `<textarea id="canvaLFeats" rows="5">Geniş Bahçe
Müstakil Havuz
Doğa İçinde
Özel Otopark
Merkezi Konum</textarea>`);
fs.writeFileSync('tpl_luks/luks.js', l);

let e = fs.readFileSync('tpl_elit/elit.js', 'utf8');
e = e.replace('value="SATILIK MÜSTAKİL EV"', 'value="SATILIK EV"');
fs.writeFileSync('tpl_elit/elit.js', e);

console.log('Defaults updated');
