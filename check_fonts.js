const https = require('https');
const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf8');
let match = html.match(/<link href="(https:\/\/fonts\.googleapis\.com\/css2\?family=[^"]+)" rel="stylesheet">/);
if (match) {
    let url = match[1];
    https.get(url, (res) => {
        console.log("Status Code:", res.statusCode);
        if (res.statusCode !== 200) {
            console.log("Error! The Google Fonts URL is invalid.");
        } else {
            console.log("Google Fonts URL is OK.");
        }
    }).on('error', (e) => {
        console.error(e);
    });
} else {
    console.log("Google Fonts URL not found in app.html");
}
