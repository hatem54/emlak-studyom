const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf8');

const oldStr = `<button class="draw-mode-btn active" id="dmOff" onclick="setDrawMode('off')">👁️ Kapalı</button>`;
const newStr = `<button class="draw-mode-btn active" id="dmOff" onclick="setDrawMode('off')">👁️ Kapalı</button>\n            <button class="draw-mode-btn" id="dmSelect" onclick="setDrawMode('select')">🖱️ Seç/Düzenle</button>`;

if (html.includes(oldStr)) {
    html = html.replace(oldStr, newStr);
    html = html.replace(/main\.js\?v=\d+/, 'main.js?v=' + Date.now());
    html = html.replace(/draw\.js\?v=\d+/, 'draw.js?v=' + Date.now());
    fs.writeFileSync('app.html', html, 'utf8');
    console.log('Successfully updated app.html');
} else {
    console.log('Could not find dmOff button in app.html. Searching with regex...');
    const regex = /<button class="draw-mode-btn active" id="dmOff"[^>]*>.*?<\/button>/;
    if (html.match(regex)) {
        html = html.replace(regex, match => match + `\n            <button class="draw-mode-btn" id="dmSelect" onclick="setDrawMode('select')">🖱️ Seç/Düzenle</button>`);
        fs.writeFileSync('app.html', html, 'utf8');
        console.log('Successfully updated app.html with regex');
    } else {
        console.log('Still could not find it.');
    }
}
