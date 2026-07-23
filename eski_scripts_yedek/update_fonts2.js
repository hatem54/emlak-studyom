const fs = require('fs');
let js = fs.readFileSync('ui/fonts.js', 'utf8');

const regex = /function applyFontSettings\(\)\{[\s\S]*?const tsc=\$\('textShadowColor'\)\.value,tsv=\$\('textShadow'\)\.value,tt=\$\('textTransform'\)\.value;/;

const replacement = `function applyFontSettings(){
    const weight=$('fontWeight').value,style=$('fontStyle').value,spacing=$('letterSpacing').value;
    const lh=($('lineHeight').value/10).toFixed(1),align=$('textAlign').value;
    const tsc=$('textShadowColor').value,tsv=$('textShadow').value,tt=$('textTransform').value;
    
    // NEW: Text Color & BG
    const tcEl = $('globalTextColor');
    const tbEl = $('globalTextBg');
    const tbTrans = $('globalBgTransparent');
    const textColor = tcEl ? tcEl.value : '#ffffff';
    const textBgColor = (tbTrans && tbTrans.checked) ? 'transparent' : (tbEl ? tbEl.value : 'transparent');
`;

if (js.match(regex)) {
    js = js.replace(regex, replacement);
    
    // Now inject the color application inside the loop
    const loopRegex = /el\.style\.textTransform=tt;/;
    js = js.replace(loopRegex, `el.style.textTransform=tt;
        el.style.color = textColor;
        el.style.backgroundColor = textBgColor;`);
        
    fs.writeFileSync('ui/fonts.js', js);
    console.log("ui/fonts.js updated.");
} else {
    console.log("Regex match failed in fonts.js");
}
