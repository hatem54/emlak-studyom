const fs = require('fs');

let content = fs.readFileSync('tpl_luks/luks.js', 'utf8');

const targetStr = `    parsedHtml = parsedHtml.replace(/font-size:\\$\\{scaleX\\((\\d+)\\)\\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));`;

const newStr = `    parsedHtml = parsedHtml.replace(/font-size:\\$\\{scaleX\\((\\d+)\\)\\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));
    // THE MISSING PARSER FOR scaleMin:
    parsedHtml = parsedHtml.replace(/font-size:\\s*\\$\\{scaleMin\\((\\d+)\\)\\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));
    parsedHtml = parsedHtml.replace(/font-size:\\$\\{scaleMin\\((\\d+)\\)\\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));
    // Also missing parser for padding with scaleMin:
    parsedHtml = parsedHtml.replace(/padding:\\s*\\$\\{scaleMin\\((\\d+)\\)\\}/g, (m, p1) => 'padding:' + Math.round(scaleMin(parseInt(p1, 10))));
`;

if(content.includes(targetStr)) {
    content = content.replace(targetStr, newStr);
    fs.writeFileSync('tpl_luks/luks.js', content, 'utf8');
    console.log("Successfully added missing scaleMin parser to luks.js!");
} else {
    console.log("Could not find target string in renderLuksTemplate");
}
