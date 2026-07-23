const fs = require('fs');

let appHtml = fs.readFileSync('app.html', 'utf8');

if (!appHtml.includes('<script src="js/formConfig.js"></script>')) {
    // Inject it just before core.js
    appHtml = appHtml.replace('<script src="core.js?v=4"></script>', '<script src="js/formConfig.js"></script>\n<script src="core.js?v=4"></script>');
    fs.writeFileSync('app.html', appHtml);
    console.log("Successfully injected js/formConfig.js into app.html");
} else {
    console.log("js/formConfig.js is already in app.html");
}
