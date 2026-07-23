const fs = require('fs');

let content = fs.readFileSync('tpl_elit/elit.js', 'utf8');

const regex = /<textarea id="canvaEFeats" rows="4">[\s\S]*?<\/textarea>/;
const newFeats = `<textarea id="canvaEFeats" rows="4">140 m² Brüt
3+1 Geniş Oda
Sıfır Yaşında
Doğalgaz Kombi</textarea>`;

if (regex.test(content)) {
    content = content.replace(regex, newFeats);
    fs.writeFileSync('tpl_elit/elit.js', content, 'utf8');
    console.log("Default Elit features reduced successfully!");
} else {
    console.log("Could not find the exact old feats string in elit.js.");
}
