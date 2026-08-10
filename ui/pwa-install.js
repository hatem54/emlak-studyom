// ui/pwa-install.js
let deferredPrompt;

// 1. Tooltip logic for first-time visitors (only if PWA is not already installed)
window.addEventListener('load', () => {
    // Check if the user is already in standalone mode (PWA installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    
    if (!isStandalone && !localStorage.getItem('pwaTooltipShown')) {
        showTopTooltip();
        localStorage.setItem('pwaTooltipShown', 'true');
    }
});

function showTopTooltip() {
    const tooltip = document.createElement('div');
    tooltip.innerHTML = 
        '<div style="' +
            'position: fixed;' +
            'top: 15px;' +
            'right: 15px;' +
            'background: linear-gradient(135deg, #6c5ce7, #a29bfe);' +
            'color: white;' +
            'padding: 12px 15px;' +
            'border-radius: 12px;' +
            'box-shadow: 0 10px 25px rgba(0,0,0,0.5);' +
            'font-size: 13px;' +
            'z-index: 10000;' +
            'display: flex;' +
            'align-items: center;' +
            'gap: 10px;' +
            'animation: slideDown 0.5s ease-out;' +
            'max-width: 250px;' +
        '">' +
            '<i class="fa-solid fa-arrow-up-right-dots" style="font-size: 20px;"></i>' +
            '<div>' +
                '<strong>Daha İyi Bir Deneyim!</strong><br>' +
                'Uygulamayı tam ekran kullanmak için sağ üstteki 3 nokta menüsünden &quot;Ana Ekrana Ekle&quot;yi seçin.' +
            '</div>' +
        '</div>' +
        '<style>' +
            '@keyframes slideDown {' +
                'from { transform: translateY(-50px); opacity: 0; }' +
                'to { transform: translateY(0); opacity: 1; }' +
            '}' +
        '</style>';
    
    document.body.appendChild(tooltip);

    // Remove after 6 seconds
    setTimeout(() => {
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.5s';
        setTimeout(() => tooltip.remove(), 500);
    }, 6000);
}

// 2. Install Prompt Logic for the Menu Button
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Attempt to add button to menu if it exists, otherwise it will be added when menu is opened
    injectInstallButton();
});

function injectInstallButton() {
    const menuContent = document.getElementById('mobileMenuContent');
    if (!menuContent) return; // Menu not created yet

    if (document.getElementById('pwa-install-menu-btn')) return; // Already exists

    const installBtn = document.createElement('button');
    installBtn.id = 'pwa-install-menu-btn';
    // Style it exactly like .help-assistant-fab from styles.css (but static)
    installBtn.innerHTML = '<i class="fa-solid fa-download"></i> Ana Ekrana Ekle';
    installBtn.className = 'help-assistant-fab';
    installBtn.style.position = 'relative'; // Override fixed position
    installBtn.style.bottom = 'auto';
    installBtn.style.right = 'auto';
    installBtn.style.width = '100%';
    installBtn.style.marginTop = '10px';
    installBtn.style.boxSizing = 'border-box';
    installBtn.style.zIndex = '1';
    
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('User response to the install prompt: ' + outcome);
        if (outcome === 'accepted') {
            installBtn.style.display = 'none';
        }
        deferredPrompt = null;
    });

    menuContent.appendChild(installBtn);
}

// Inject it when the menu is opened, in case beforeinstallprompt fired before menu existed
document.addEventListener('click', (e) => {
    if (e.target.closest('.mobile-menu-btn') && deferredPrompt) {
        setTimeout(injectInstallButton, 100);
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
