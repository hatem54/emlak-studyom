const fs = require('fs');

const core = fs.readFileSync('core.js', 'utf8');
const main = fs.readFileSync('main.js', 'utf8');

function extractFunction(content, funcName) {
    const searchStr = `function ${funcName}(`;
    let startIndex = content.indexOf(searchStr);
    if (startIndex === -1) {
        // Try without arguments
        const searchStr2 = `function ${funcName} (`;
        startIndex = content.indexOf(searchStr2);
        if (startIndex === -1) return null;
    }

    let openBrackets = 0;
    let started = false;
    let endIndex = -1;

    for (let i = startIndex; i < content.length; i++) {
        // Skip string literals
        if (content[i] === "'" || content[i] === '"' || content[i] === '\`') {
            const quote = content[i];
            i++;
            while (i < content.length && (content[i] !== quote || content[i-1] === '\\')) {
                i++;
            }
            continue;
        }

        if (content[i] === '{') {
            openBrackets++;
            started = true;
        } else if (content[i] === '}') {
            openBrackets--;
        }

        if (started && openBrackets === 0) {
            endIndex = i + 1;
            break;
        }
    }

    if (endIndex !== -1) {
        return content.substring(startIndex, endIndex);
    }
    return null;
}

const funcsToExtract = [
    { name: 'renderCalloutPanel', source: main },
    { name: 'addCalloutToCanvas', source: main },
    { name: 'addCallout', source: main },
    { name: 'selectCallout', source: main },
    { name: 'renderNeonCallouts', source: main },
    { name: 'addNeonToCanvas', source: main },
    { name: 'selectCalloutEl', source: main },
    { name: 'closeCalloutPanel', source: main },
    { name: 'renderCalloutFromDataset', source: main },
    { name: 'applyCalloutSettings', source: main },
    { name: 'resetCalloutSetting', source: main },
    { name: 'deleteSelectedCallout', source: main },
    { name: 'enableInlineEdit', source: core }
];

let calloutContent = `/**
 * ============================================
 * CALLOUT MODULE
 * modules/callout.js
 * ============================================
 * 
 * Bağımlılıklar:
 * - config.js
 * - core/drag.js
 * 
 * Kullanılan yerler:
 * - main.js
 */\n\n`;

for (let item of funcsToExtract) {
    const code = extractFunction(item.source, item.name);
    if (code) {
        calloutContent += code + '\n\n';
    } else {
        console.log('Bulunamadı: ' + item.name);
    }
}

fs.writeFileSync('modules/callout.js', calloutContent);
console.log('modules/callout.js güvenle ve mükemmel bir şekilde oluşturuldu.');
