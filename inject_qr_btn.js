const fs = require('fs');
let lines = fs.readFileSync('app.html', 'utf-8').split(/\r?\n/);

let insertIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('data-tab="icons"')) {
        insertIdx = i + 1;
        break;
    }
}

if (insertIdx !== -1) {
    // Check if QR Kod is already there
    let alreadyExists = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('data-tab="qr"')) {
            alreadyExists = true;
            break;
        }
    }

    if (!alreadyExists) {
        lines.splice(insertIdx, 0, `    <button class="tab-btn" data-tab="qr" onclick="switchTab('qr')" data-tooltip="Bağlantılardan QR kod oluşturun">📱 QR Kod</button>`);
        fs.writeFileSync('app.html', lines.join('\n'));
        console.log("QR Kod button successfully inserted.");
    } else {
        console.log("QR Kod button already exists.");
    }
} else {
    console.log("Could not find icons button.");
}
