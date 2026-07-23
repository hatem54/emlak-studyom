const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/app.html';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `<div class="draw-mode-btns">
            <button class="draw-mode-btn active" id="dmOff" onclick="setDrawMode('off')">🚫 Kapalı</button>
            <button class="draw-mode-btn" id="dmFree" onclick="setDrawMode('free')">✏️ Serbest</button>
            <button class="draw-mode-btn" id="dmLine" onclick="setDrawMode('line')">📏 Düz</button>
            <button class="draw-mode-btn" id="dmArrow" onclick="setDrawMode('arrow')">➡️ Ok</button>
            <button class="draw-mode-btn" id="dmRect" onclick="setDrawMode('rect')">⬜ Kare</button>
            <button class="draw-mode-btn" id="dmCircle" onclick="setDrawMode('circle')">⭕ Daire</button>
            <button class="draw-mode-btn" id="dmPoly" onclick="setDrawMode('polygon')">🔷 Çokgen</button>
        </div>`;

const replaceStr = targetStr + `
        <div class="snap-toggle-container" style="margin-top: 10px; padding: 10px; background: #1e293b; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; border: 1px solid #334155;">
            <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size: 16px;">🧲</span>
                <span style="color: #e2e8f0; font-size: 14px; font-weight: 500;">Akıllı Hizalama (Snap)</span>
            </div>
            <label class="saber-toggle" style="margin:0; min-width: 40px;">
                <input type="checkbox" id="drawSnapToggle" checked>
                <span class="saber-toggle-slider"></span>
            </label>
        </div>`;

if(code.includes(targetStr)) {
    code = code.replace(targetStr, replaceStr);
    fs.writeFileSync(file, code, 'utf8');
    console.log('Added Snap Toggle to app.html');
} else {
    console.log('Could not find target string in app.html');
}
