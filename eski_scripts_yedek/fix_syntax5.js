const fs = require('fs');
let txt = fs.readFileSync('tpl_kurumsal/kurumsal.js', 'utf8');
const lines = txt.split('\n');

const k8LineIndex = lines.findIndex(l => l.includes('canvaK8'));
let html = lines[k8LineIndex + 1];

if (!html.endsWith('`;')) {
    lines[k8LineIndex + 1] = html + '`;';
}

if (lines[k8LineIndex + 2].trim() === '}`;') {
    lines[k8LineIndex + 2] = '    }';
} else if (lines[k8LineIndex + 2].trim() === '};') {
    lines[k8LineIndex + 2] = '    }';
}

fs.writeFileSync('tpl_kurumsal/kurumsal.js', lines.join('\n'));
console.log('Fixed syntax error for Kurumsal 8.');
