const fs = require('fs');

let mainJs = fs.readFileSync('main.js', 'utf8');

// Replace DOMContentLoaded block
const oldDOMBlock = `window.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 640) {
    if (localStorage.getItem('chromeRedirected') === 'true') return;
    if (isRealChrome()) {
      localStorage.setItem('chromeRedirected', 'true');
      return;
    }
    showRedirectToastAndGo();
  }
});`;

const newDOMBlock = `window.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 640) {
    if (localStorage.getItem('chromeRedirected') === 'true') return;
    
    // iOS'ta çalışma (Safari kalır)
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      localStorage.setItem('chromeRedirected', 'true');
      return;
    }
    
    // Sadece in-app browser'dan geldiyse yönlendir
    const isInAppBrowser = /Instagram|FBAN|FBAV|FB_IAB|WhatsApp|Line|MicroMessenger|Twitter|LinkedInApp|TikTok|GSA/i.test(navigator.userAgent);
    
    if (!isInAppBrowser) {
      // Normal Chrome/Firefox/vs kullanıcısı - yönlendirme yok
      localStorage.setItem('chromeRedirected', 'true');
      return;
    }

    if (isRealChrome()) {
      localStorage.setItem('chromeRedirected', 'true');
      return;
    }
    showRedirectToastAndGo();
  }
});`;

if (mainJs.includes("if (isRealChrome()) {") && !mainJs.includes("isInAppBrowser")) {
    mainJs = mainJs.replace(oldDOMBlock, newDOMBlock);
    console.log("Updated DOMContentLoaded block.");
} else {
    console.log("DOMContentLoaded block not found or already updated.");
}

// Replace performRedirect block
const oldPerformRedirect = `function performRedirect() {
  const currentUrl = window.location.href;
  if (/Android/i.test(navigator.userAgent)) {
    const cleanUrl = currentUrl.replace(/^https?:\\/\\//, '');
    window.location.href = \`intent://\${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end\`;
  }
  else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    const chromeUrl = currentUrl.replace(/^https?:\\/\\//, 'googlechrome://');
    window.location.href = chromeUrl;
  }
}`;

const newPerformRedirect = `function performRedirect() {
  const currentUrl = window.location.href;
  const cleanUrl = currentUrl.replace(/^https?:\\/\\//, '');
  
  try {
    window.location.href = \`intent://\${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end\`;
  } catch (e) {
    console.log('Chrome yüklü değil veya yönlendirme başarısız.');
  }
  
  // 3 saniye sonra toast'ı kaldır (yönlendirme başarısızsa)
  setTimeout(() => {
    document.getElementById('chromeRedirectToast')?.remove();
  }, 3000);
}`;

if (mainJs.includes("function performRedirect() {") && !mainJs.includes("chromeRedirectToast')?.remove()")) {
    mainJs = mainJs.replace(oldPerformRedirect, newPerformRedirect);
    console.log("Updated performRedirect block.");
} else {
    console.log("performRedirect block not found or already updated.");
}

fs.writeFileSync('main.js', mainJs, 'utf8');
console.log('Security updates applied to main.js');
