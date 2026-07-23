const fs = require('fs');
let m = fs.readFileSync('tpl_minimal/minimal.js', 'utf8');

m = m.replace(/bottom:\$\{scaleY\(20\)\}px;right:\$\{scaleX\(40\)\}px;text-align:right;/g, 'bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;'); // REVERT first
// Also revert the broken ones:
m = m.replace(/bottom:px;right:px;text-align:right;/g, 'bottom:${scaleY(20)}px;right:${scaleX(40)}px;text-align:right;');

// For M2, it was scaleY(40):
m = m.replace(/M2.*?bottom:\$\{scaleY\(20\)\}px;right:\$\{scaleX\(40\)\}px;text-align:right;/g, function(match) {
    return match.replace('scaleY(20)', 'scaleY(40)');
});

fs.writeFileSync('tpl_minimal/minimal.js', m);
console.log('Fixed file');
