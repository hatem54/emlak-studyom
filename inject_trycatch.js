const fs = require('fs');
let js = fs.readFileSync('modules/callout_v2.js', 'utf8');

const oldFunc = `function selectCalloutEl(el) {
    if (typeof selectedCalloutEl !== 'undefined' && selectedCalloutEl && selectedCalloutEl !== el) {`;

const newFunc = `function selectCalloutEl(el) {
  try {
    if (typeof selectedCalloutEl !== 'undefined' && selectedCalloutEl && selectedCalloutEl !== el) {`;

const oldEnd = `        }
    }
}`;

const newEnd = `        }
    }
  } catch(err) {
    console.error("SELECT CALLOUT ERROR:", err);
    alert("SELECT CALLOUT ERROR: " + err.message + "\\n" + err.stack);
  }
}`;

js = js.replace(oldFunc, newFunc);
// Find the end of selectCalloutEl to inject the catch block.
// It's the last closing brace before function closeCalloutPanel()
const closeIndex = js.indexOf('function closeCalloutPanel()');
const lastBraceIndex = js.lastIndexOf('}', closeIndex);
const beforeLastBrace = js.substring(0, lastBraceIndex);
const afterLastBrace = js.substring(lastBraceIndex + 1);

// Actually, let's just do a safer replace using substring.
// We know the end of the function is just before `function closeCalloutPanel`
const startIdx = js.indexOf('function selectCalloutEl(el) {');
const endIdx = js.indexOf('function closeCalloutPanel()', startIdx);
let funcBody = js.substring(startIdx, endIdx);

funcBody = funcBody.replace('function selectCalloutEl(el) {', 'function selectCalloutEl(el) {\n  try {');
// The last non-whitespace character in funcBody is the closing brace '}'
funcBody = funcBody.trimEnd();
if (funcBody.endsWith('}')) {
    funcBody = funcBody.slice(0, -1) + `  } catch(err) {\n    console.error("SELECT CALLOUT ERROR:", err);\n    alert("SELECT CALLOUT ERROR: " + err.message + "\\n" + err.stack);\n  }\n}\n\n`;
}

js = js.substring(0, startIdx) + funcBody + js.substring(endIdx);
fs.writeFileSync('modules/callout_v2.js', js);
console.log("try-catch added to selectCalloutEl");
