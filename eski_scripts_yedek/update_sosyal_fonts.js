const fs = require('fs');
let txt = fs.readFileSync('tpl_sosyal/sosyal.js', 'utf8');

// 1. Change default contact
txt = txt.replace('value="EMLAK STUDIO | 0532 000 0000"', 'value="EMLAK STUDYOM | 0532 000 0000"');

// 2. Reduce title font sizes using regex
// We look for patterns where title is rendered:
// <div style="font-size:${scaleMin(XXX)}px...>${title}</span></div>
// To be safe, we'll manually replace the specific font sizes for ${title} in the known strings.

// S1: 76 -> 60
txt = txt.replace(/\{scaleMin\(76\)\}px(.*?\$\{title\})/g, '{scaleMin(60)}px$1');
// S2, S3, S8, S9: 101 -> 75
txt = txt.replace(/\{scaleMin\(101\)\}px(.*?\$\{title\})/g, '{scaleMin(75)}px$1');
// S4: 93 -> 70
txt = txt.replace(/\{scaleMin\(93\)\}px(.*?\$\{title\})/g, '{scaleMin(70)}px$1');
// S5: 110 -> 80
txt = txt.replace(/\{scaleMin\(110\)\}px(.*?\$\{title\})/g, '{scaleMin(80)}px$1');
// S6: 124 -> 90
txt = txt.replace(/\{scaleMin\(124\)\}px(.*?\$\{title\})/g, '{scaleMin(90)}px$1');
// S7: 103 -> 75
txt = txt.replace(/\{scaleMin\(103\)\}px(.*?\$\{title\})/g, '{scaleMin(75)}px$1');
// S10: 70 -> 55
txt = txt.replace(/\{scaleMin\(70\)\}px(.*?\$\{title\})/g, '{scaleMin(55)}px$1');

fs.writeFileSync('tpl_sosyal/sosyal.js', txt);
console.log('Sosyal medya templates updated: Emlak Studyom default + reduced title sizes.');
