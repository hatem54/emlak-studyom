const fs = require('fs');

// 1. UPDATE APP.HTML
let appHtml = fs.readFileSync('app.html', 'utf8');

// Add "Tarayıcıda Aç" button
const btnHtml = `
                <hr style="border-color: rgba(255,255,255,0.1); margin: 5px 20px;">
                <button id="openInBrowserBtn" class="menu-link mobile-only" style="display:none; padding:0 20px; color:#cbd5e1; text-decoration:none; font-size: 16px; background:transparent; border:none; text-align:left; cursor:pointer; width:100%; margin-top:10px;">
                    <i class="fa-solid fa-globe"></i> Tarayıcıda Aç
                </button>`;

if (!appHtml.includes('openInBrowserBtn')) {
    appHtml = appHtml.replace('<hr style="border-color: rgba(255,255,255,0.1); margin: 5px 20px;">', btnHtml);
}

// Update Meta Viewport
if (!appHtml.includes('viewport-fit=cover')) {
    appHtml = appHtml.replace('<meta name="viewport" content="width=device-width, initial-scale=1.0">', '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">');
}

// Bump main.js cache
appHtml = appHtml.replace(/main\.js\?v=\d+/, 'main.js?v=' + Date.now());

fs.writeFileSync('app.html', appHtml, 'utf8');
console.log('Updated app.html');

// 2. UPDATE STYLES.CSS
let css = fs.readFileSync('styles.css', 'utf8');
const newCSS = `
/* ===== MOBILE BROWSER BTN & AI BAR FIXES ===== */
@media (max-width: 640px) {
  .mobile-only {
    display: block !important;
  }
  body {
    padding-bottom: 60px !important;
  }
  #mainTabs {
    padding-bottom: max(env(safe-area-inset-bottom), 15px) !important;
    margin-bottom: var(--browser-bar-height, 0px) !important;
    z-index: 100 !important;
    background: #16162a !important;
  }
  .container {
    height: auto !important;
    min-height: 100dvh !important;
  }
}
@media (min-width: 641px) {
  #openInBrowserBtn { display: none !important; }
}
`;
if (!css.includes('MOBILE BROWSER BTN')) {
    css += '\n' + newCSS;
    fs.writeFileSync('styles.css', css, 'utf8');
    console.log('Updated styles.css');
}

// 3. UPDATE MAIN.JS
let mainJs = fs.readFileSync('main.js', 'utf8');
const newJs = `
// Open in Browser Button Logic
document.addEventListener('click', (e) => {
    if (e.target.closest('#openInBrowserBtn')) {
        const currentUrl = window.location.href;
        if (/Android/i.test(navigator.userAgent)) {
            window.open(currentUrl, '_system');
        } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.open(currentUrl, '_blank');
        } else {
            window.open(currentUrl, '_blank');
        }
        if (typeof toggleMobileMenu === 'function') toggleMobileMenu();
    }
});

// Visual Viewport API for Chrome AI bar
if (window.visualViewport && window.innerWidth <= 640) {
  const adjustLayout = () => {
    const offset = window.innerHeight - window.visualViewport.height;
    document.documentElement.style.setProperty('--browser-bar-height', \`\${offset}px\`);
  };
  window.visualViewport.addEventListener('resize', adjustLayout);
  window.addEventListener('load', adjustLayout);
}
`;
if (!mainJs.includes('openInBrowserBtn')) {
    mainJs += '\n' + newJs;
    fs.writeFileSync('main.js', mainJs, 'utf8');
    console.log('Updated main.js');
}

console.log('All script tasks finished!');
