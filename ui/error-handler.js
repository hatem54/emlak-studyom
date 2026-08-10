/**
 * Global Error Handler
 * Yakalanmayan JS hatalarını ve Promise çökmelerini ekranda Toast olarak gösterir.
 */
(function() {
    let errorToastTimer = null;

    function showGlobalErrorToast(msg) {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => showGlobalErrorToast(msg));
            return;
        }

        let toast = document.getElementById('global-error-toast');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'global-error-toast';
            // Koyu tema uyumlu CSS stilleri
            toast.style.position = 'fixed';
            toast.style.top = '20px';
            toast.style.right = '20px';
            toast.style.backgroundColor = '#1e1e2f';
            toast.style.color = '#fff';
            toast.style.border = '1px solid #ff4d4d';
            toast.style.borderRadius = '8px';
            toast.style.padding = '15px 20px';
            toast.style.boxShadow = '0 4px 15px rgba(255, 77, 77, 0.2)';
            toast.style.zIndex = '9999999';
            toast.style.display = 'flex';
            toast.style.alignItems = 'center';
            toast.style.gap = '15px';
            toast.style.fontFamily = 'sans-serif';
            toast.style.fontSize = '14px';
            toast.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';

            // İçerik yapısı (İkon, Mesaj, Kapatma Butonu)
            toast.innerHTML = `
                <div style="color: #ff4d4d; font-size: 20px;">
                    <i class="fas fa-exclamation-circle" style="font-style:normal;">⚠</i>
                </div>
                <div style="flex: 1; font-weight: 500;">
                    ${msg || 'Bir sorun oluştu. Lütfen sayfayı yenileyin.'}
                </div>
                <button id="global-error-toast-close" style="background: none; border: none; color: #aaa; cursor: pointer; font-size: 16px; padding: 0;">
                    ✖
                </button>
            `;

            document.body.appendChild(toast);

            // Kapatma butonu işlevi
            document.getElementById('global-error-toast-close').addEventListener('click', function() {
                hideGlobalErrorToast();
            });
        } else {
            // Toast zaten varsa mesajı güncelle
            toast.querySelector('div:nth-child(2)').innerText = msg || 'Bir sorun oluştu. Lütfen sayfayı yenileyin.';
        }

        // Animasyonla göster
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);

        // Eski sayacı temizle ve yenisini başlat (5 saniye)
        if (errorToastTimer) {
            clearTimeout(errorToastTimer);
        }
        errorToastTimer = setTimeout(() => {
            hideGlobalErrorToast();
        }, 5000);
    }

    function hideGlobalErrorToast() {
        const toast = document.getElementById('global-error-toast');
        if (toast) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            // DOM'dan kaldırmak istiyorsak timeout sonrası remove edebiliriz
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    // 1. Standart JS hatalarını yakala
    window.onerror = function(message, source, lineno, colno, error) {
        showGlobalErrorToast("Bir sorun oluştu. Lütfen sayfayı yenileyin.");
        console.error("Global JS Error:", message, "at", source, lineno + ":" + colno, error);
        return false; // Tarayıcının varsayılan hata gösterimini engelleme (konsola düşsün)
    };

    // 2. Promise (Asenkron) hatalarını yakala
    window.addEventListener('unhandledrejection', function(event) {
        showGlobalErrorToast("Bir sorun oluştu. Lütfen sayfayı yenileyin.");
        console.error("Unhandled Promise Rejection:", event.reason);
    });

})();
