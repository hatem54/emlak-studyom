const fs = require('fs');
let code = fs.readFileSync('modules/saber.js', 'utf8');

const tickerAnchor = "        app.ticker.add((delta) => {\n            time += 0.05 * delta;";
const tickerInsert = `\n            updateTextSaberPositions();`;

if (code.includes(tickerAnchor)) {
    code = code.split(tickerAnchor).join(tickerAnchor + tickerInsert);
    fs.writeFileSync('modules/saber.js', code);
    console.log('Added updateTextSaberPositions to ticker.');
} else {
    console.log('Ticker anchor not found.');
}
