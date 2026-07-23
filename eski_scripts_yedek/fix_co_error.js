const fs = require('fs');
let js = fs.readFileSync('modules/callout_v2.js', 'utf8');

js = js.replace("console.log('✅ Callout eklendi:', co.text);", "console.log('✅ Callout eklendi:', item.name);");

fs.writeFileSync('modules/callout_v2.js', js);
console.log("Bug fixed.");
