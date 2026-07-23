const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf8');

// 1. Extract the forms block
let formsMatch = html.match(/<div id="konutForm">[\s\S]*?<button class="btn-action btn-purple" onclick="applyCustomCode\(\)">Uygula<\/button>\s*<\/div>/);
if (!formsMatch) {
    console.log("Forms block not found");
} else {
    let formsHtml = formsMatch[0];
    html = html.replace(formsHtml, ''); // remove from original position
    
    // 2. Fix accordion content
    let accordionMatch = html.match(/<div style="padding: 12px; border-top: 1px solid #1e293b;">([\s\S]*?)<\/details>/);
    if(accordionMatch) {
        let durumDescMatch = html.match(/<div class="row-2">\s*<div class="input-group"><label>Durum<\/label>[\s\S]*?<\/textarea>\s*<\/div>/);
        if(durumDescMatch) {
            let pureDurumDesc = durumDescMatch[0];
            
            let newAccordionContent = `\n<div style="padding: 12px; border-top: 1px solid #1e293b;">\n` + 
                                      pureDurumDesc + `\n` + 
                                      `<div class="template-grid" id="templateGrid"></div>\n` + 
                                      formsHtml + `\n` +
                                      `</div>\n`;
            
            html = html.replace(/<div style="padding: 12px; border-top: 1px solid #1e293b;">[\s\S]*?<\/details>/, newAccordionContent + "</details>");
        } else {
            console.log("Durum desc match failed.");
        }
    } else {
        console.log("Accordion match failed.");
    }
}

fs.writeFileSync('app.html', html);
console.log("Fix applied!");
