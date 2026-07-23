const fs = require('fs');

// 1. UPDATE STYLES.CSS
let css = fs.readFileSync('styles.css', 'utf8');
const newCSS = `
/* ===== MOBILE CHROME & AI BAR FIXES ===== */
@media (max-width: 640px) {
  .mobile-only {
    display: flex !important;
  }
  #mainTabs {
    padding-bottom: max(env(safe-area-inset-bottom), 15px) !important;
    margin-bottom: var(--browser-bar-height, 0px) !important;
  }
  body {
    padding-bottom: 60px !important;
  }
  .container {
    height: auto !important;
    min-height: 100dvh !important;
  }
}
`;
if (!css.includes('MOBILE CHROME & AI BAR FIXES')) {
    css += '\n' + newCSS;
    fs.writeFileSync('styles.css', css, 'utf8');
    console.log('Added CSS for mobile fixes.');
}

// 2. UPDATE MAIN.JS
let mainJs = fs.readFileSync('main.js', 'utf8');

// Insert the reset button into the hamburger menu
const resetBtnHtml = `
                <hr style="border-color: rgba(255,255,255,0.1); margin: 5px 20px;">
                <button id="resetRedirectBtn" class="menu-link mobile-only" style="display:none; padding:0 20px; color:#cbd5e1; text-decoration:none; font-size: 16px; background:transparent; border:none; text-align:left; cursor:pointer;">
                    <i class="fa-solid fa-rotate-right"></i> Normal Görünüme Dön
                </button>`;
if (!mainJs.includes('resetRedirectBtn')) {
    mainJs = mainJs.replace('<hr style="border-color: rgba(255,255,255,0.1); margin: 5px 20px;">', resetBtnHtml);
}

// Add the JS logic
const jsLogic = `
/* ===== MOBILE CHROME REDIRECT & FIXES ===== */
window.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 640) {
    if (localStorage.getItem('chromeRedirected') === 'true') return;
    if (isRealChrome()) {
      localStorage.setItem('chromeRedirected', 'true');
      return;
    }
    showRedirectToastAndGo();
  }
});

function isRealChrome() {
  const ua = navigator.userAgent;
  return /Chrome/.test(ua) && 
         !/Instagram|FBAN|FBAV|WhatsApp|Line|LinkedInApp|Twitter|GSA/i.test(ua);
}

function showRedirectToastAndGo() {
  const toast = document.createElement('div');
  toast.id = 'chromeRedirectToast';
  toast.innerHTML = \`
    <div style="
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      z-index: 999999;
      font-size: 14px;
      width: 90%;
      text-align: center;
      animation: slideDown 0.3s ease;
    ">
      <div style="font-size: 24px; margin-bottom: 8px;">🌐</div>
      <div style="font-weight: bold; margin-bottom: 4px;">Daha iyi bir deneyim için</div>
      <div style="font-size: 13px; opacity: 0.95;">Chrome'a yönlendiriliyorsunuz...</div>
    </div>
    <style>
      @keyframes slideDown {
        from { opacity: 0; transform: translate(-50%, -20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
    </style>
  \`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    localStorage.setItem('chromeRedirected', 'true');
    performRedirect();
  }, 1500);
}

function performRedirect() {
  const currentUrl = window.location.href;
  if (/Android/i.test(navigator.userAgent)) {
    const cleanUrl = currentUrl.replace(/^https?:\\/\\//, '');
    window.location.href = \`intent://\${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end\`;
  }
  else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    const chromeUrl = currentUrl.replace(/^https?:\\/\\//, 'googlechrome://');
    window.location.href = chromeUrl;
  }
}

// Reset button click handler
document.addEventListener('click', (e) => {
    if (e.target.closest('#resetRedirectBtn')) {
        localStorage.removeItem('chromeRedirected');
        alert('✅ Ayar sıfırlandı. Sayfayı yenilediğinizde Chrome yönlendirmesi tekrar aktif olacak.');
        if (typeof toggleMobileMenu === 'function') toggleMobileMenu();
    }
});

// Visual Viewport API for Chrome AI bar
if (window.visualViewport && window.innerWidth <= 640) {
  window.visualViewport.addEventListener('resize', adjustLayout);
  window.addEventListener('load', adjustLayout);
  
  function adjustLayout() {
    const offset = window.innerHeight - window.visualViewport.height;
    document.documentElement.style.setProperty('--browser-bar-height', \`\${offset}px\`);
  }
}
`;
if (!mainJs.includes('performRedirect')) {
    mainJs += '\n' + jsLogic;
    fs.writeFileSync('main.js', mainJs, 'utf8');
    console.log('Added JS logic to main.js');
}

// 3. UPDATE APP.HTML META TAG
let appHtml = fs.readFileSync('app.html', 'utf8');
if (!appHtml.includes('viewport-fit=cover')) {
    appHtml = appHtml.replace('<meta name="viewport" content="width=device-width, initial-scale=1.0">', '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">');
    // Bump cache for main.js
    appHtml = appHtml.replace(/main\.js\?v=\d+/, 'main.js?v=' + Date.now());
    fs.writeFileSync('app.html', appHtml, 'utf8');
    console.log('Updated app.html meta tag and bumped main.js cache');
}

console.log('All updates applied!');
