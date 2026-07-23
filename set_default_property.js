const fs = require('fs');

let appHtml = fs.readFileSync('app.html', 'utf8');

if (!appHtml.includes("Make 'Satılık Daire' the default on load")) {
    const defaultInitScript = `
<script>
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Make 'Satılık Daire' the default on load
        const defaultEl = document.querySelector('.cat-item[onclick*="satilik_daire"]');
        if(defaultEl && typeof selectProperty === 'function') {
            selectProperty('satilik_daire', defaultEl);
            const group = defaultEl.closest('.cat-group');
            if(group) {
                const body = group.querySelector('.cat-body');
                const icon = group.querySelector('.cat-header i');
                if(body) body.classList.add('open');
                if(icon) {
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                }
            }
        }
    }, 100); // slight delay to ensure scripts are loaded
});
</script>
`;
    appHtml = appHtml.replace('</body>', defaultInitScript + '</body>');
    fs.writeFileSync('app.html', appHtml);
    console.log("Successfully injected default selection script into app.html");
} else {
    console.log("Default selection script already exists.");
}

// Ensure core.js defaults currentMode to satilik_daire
let coreJs = fs.readFileSync('core.js', 'utf8');
if (coreJs.includes("let currentMode='konut'")) {
    coreJs = coreJs.replace("let currentMode='konut'", "let currentMode='satilik_daire'");
    fs.writeFileSync('core.js', coreJs);
    console.log("Changed core.js default mode from konut to satilik_daire");
}
