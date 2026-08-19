// ============================================
// EmlakStüdyom - Kayıt/Giriş Sistemi
// ============================================

// Modal açma/kapama
function openModal(type) {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('active');
    switchForm(type);
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function switchForm(type) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm = document.getElementById('forgotPasswordForm');
  const resetForm = document.getElementById('resetPasswordForm');
  
  if (loginForm) loginForm.style.display = 'none';
  if (registerForm) registerForm.style.display = 'none';
  if (forgotForm) forgotForm.style.display = 'none';
  if (resetForm) resetForm.style.display = 'none';

  if (type === 'login') {
    if (loginForm) loginForm.style.display = 'block';
  } else if (type === 'register') {
    if (registerForm) registerForm.style.display = 'block';
  } else if (type === 'forgot') {
    if (forgotForm) {
      forgotForm.style.display = 'block';
      const loginEmail = document.getElementById('loginEmail');
      const forgotEmail = document.getElementById('forgotEmail');
      if (loginEmail && forgotEmail && loginEmail.value.trim() && !forgotEmail.value.trim()) {
        forgotEmail.value = loginEmail.value.trim();
      }
    }
  } else if (type === 'reset') {
    if (resetForm) resetForm.style.display = 'block';
  }
}

// Toast bildirim göster
function showToast(message, type = 'info') {
  const existing = document.getElementById('authToast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.id = 'authToast';
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 999999;
    padding: 16px 24px; border-radius: 8px; color: white;
    font-family: system-ui, -apple-system, sans-serif; font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 400px;
    background: ${type === 'error' ? '#dc2626' : type === 'success' ? '#16a34a' : '#2563eb'};
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// KAYIT İŞLEMİ
async function handleRegister(event) {
  if (event && event.preventDefault) event.preventDefault();
  
  const nameInput = document.getElementById('registerName') || document.querySelector('#registerForm input[type="text"]');
  const emailInput = document.getElementById('registerEmail') || document.querySelector('#registerForm input[type="email"]');
  const passwordInput = document.getElementById('registerPassword') || document.querySelector('#registerForm input[type="password"], #registerForm input[type="text"]:not(#registerName)');
  
  const fullName = nameInput ? nameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';
  
  if (!fullName || !email || !password) {
    showToast('Lütfen tüm alanları doldurun', 'error');
    return;
  }
  
  if (password.length < 6) {
    showToast('Şifre en az 6 karakter olmalıdır', 'error');
    return;
  }
  
  const form = document.getElementById('registerForm');
  const btn = form ? form.querySelector('.btn-submit') : null;
  const originalText = btn ? btn.textContent : 'Ücretsiz Başla';
  if (btn) {
    btn.textContent = 'Kayıt yapılıyor...';
    btn.disabled = true;
  }
  
  try {
    const client = window.supabaseClient || (typeof initSupabase === 'function' ? initSupabase() : null);
    if (!client) throw new Error('Veritabanı bağlantısı kurulamadı. Lütfen sayfayı yenileyin.');

    const { data, error } = await client.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { full_name: fullName }
      }
    });
    
    if (error) throw error;
    
    showEmailVerificationModal(email);
    
  } catch (error) {
    console.error('Kayıt hatası:', error);
    let msg = 'Kayıt sırasında hata oluştu';
    if (error.message && error.message.includes('already registered')) msg = 'Bu e-posta zaten kayıtlı';
    if (error.message && error.message.includes('valid email')) msg = 'Geçerli bir e-posta girin';
    showToast(msg, 'error');
  } finally {
    if (btn) {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }
}

// GİRİŞ İŞLEMİ
async function handleLogin(event) {
  if (event && event.preventDefault) event.preventDefault();
  
  const emailInput = document.getElementById('loginEmail') || document.querySelector('#loginForm input[type="email"]');
  const passwordInput = document.getElementById('loginPassword') || document.querySelector('#loginForm input[type="password"], #loginForm input[type="text"]');
  
  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';
  
  if (!email || !password) {
    showToast('Lütfen e-posta ve şifrenizi girin', 'error');
    return;
  }
  
  const form = document.getElementById('loginForm');
  const btn = form ? form.querySelector('.btn-submit') : null;
  const originalText = btn ? btn.textContent : 'Giriş Yap';
  if (btn) {
    btn.textContent = 'Giriş yapılıyor...';
    btn.disabled = true;
  }
  
  try {
    const client = window.supabaseClient || (typeof initSupabase === 'function' ? initSupabase() : null);
    if (!client) throw new Error('Veritabanı bağlantısı kurulamadı. Lütfen sayfayı yenileyin.');

    const { data, error } = await client.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) throw error;
    
    showToast('✅ Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
    setTimeout(() => {
      window.location.href = 'app.html?mode=pro';
    }, 1000);
    
  } catch (error) {
    console.error('Giriş hatası:', error);
    let msg = error.message || 'Giriş sırasında hata oluştu';
    if (msg.includes('Invalid login') || msg.includes('invalid_credentials')) {
      msg = 'E-posta veya şifre hatalı';
    } else if (msg.includes('Email not confirmed')) {
      showEmailNotConfirmedModal(email);
      return;
    }
    showToast(msg, 'error');
  } finally {
    if (btn) {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }
}

// ŞİFREMİ UNUTTUM (SIFIRLAMA BAĞLANTISI GÖNDER)
async function handleForgotPassword(event) {
  if (event && event.preventDefault) event.preventDefault();
  
  const emailInput = document.getElementById('forgotEmail');
  const email = emailInput ? emailInput.value.trim() : '';
  
  if (!email) {
    showToast('Lütfen e-posta adresinizi girin', 'error');
    return;
  }
  
  const form = document.getElementById('forgotPasswordForm');
  const btn = form ? form.querySelector('.btn-submit') : null;
  const origText = btn ? btn.textContent : 'Sıfırlama Bağlantısı Gönder';
  if (btn) {
    btn.textContent = 'Gönderiliyor...';
    btn.disabled = true;
  }
  
  try {
    const client = window.supabaseClient || (typeof initSupabase === 'function' ? initSupabase() : null);
    if (!client) throw new Error('Veritabanı bağlantısı kurulamadı. Lütfen sayfayı yenileyin.');
    
    const currentUrl = window.location.href.split('#')[0].split('?')[0];
    const { data, error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: currentUrl
    });
    
    if (error) throw error;
    
    showToast('📧 Şifre sıfırlama bağlantısı e-postanıza gönderildi! Lütfen gelen ve spam kutunuzu kontrol edin.', 'success');
    
    setTimeout(() => {
      switchForm('login');
    }, 4000);
    
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    let msg = error.message || 'Sıfırlama bağlantısı gönderilemedi';
    if (msg.includes('rate limit')) msg = 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.';
    showToast(msg, 'error');
  } finally {
    if (btn) {
      btn.textContent = origText;
      btn.disabled = false;
    }
  }
}

// YENİ ŞİFRE BELİRLEME (RECOVERY SONRASI)
async function handleUpdatePassword(event) {
  if (event && event.preventDefault) event.preventDefault();
  
  const newPassInput = document.getElementById('newPassword');
  const newPassConfirmInput = document.getElementById('newPasswordConfirm');
  
  const newPass = newPassInput ? newPassInput.value : '';
  const newPassConfirm = newPassConfirmInput ? newPassConfirmInput.value : '';
  
  if (!newPass || newPass.length < 6) {
    showToast('Şifre en az 6 karakter olmalıdır', 'error');
    return;
  }
  if (newPass !== newPassConfirm) {
    showToast('Girdiğiniz şifreler birbiriyle eşleşmiyor', 'error');
    return;
  }
  
  const form = document.getElementById('resetPasswordForm');
  const btn = form ? form.querySelector('.btn-submit') : null;
  const origText = btn ? btn.textContent : 'Şifreyi Güncelle ve Giriş Yap';
  if (btn) {
    btn.textContent = 'Güncelleniyor...';
    btn.disabled = true;
  }
  
  try {
    const client = window.supabaseClient || (typeof initSupabase === 'function' ? initSupabase() : null);
    if (!client) throw new Error('Veritabanı bağlantısı kurulamadı.');
    
    const { data, error } = await client.auth.updateUser({
      password: newPass
    });
    
    if (error) throw error;
    
    showToast('🎉 Şifreniz başarıyla güncellendi! Yönlendiriliyorsunuz...', 'success');
    setTimeout(() => {
      window.location.href = 'app.html?mode=pro';
    }, 1500);
    
  } catch (error) {
    console.error('Şifre güncelleme hatası:', error);
    showToast(error.message || 'Şifre güncellenemedi', 'error');
  } finally {
    if (btn) {
      btn.textContent = origText;
      btn.disabled = false;
    }
  }
}

// Demo moduna git
function goToDemo() {
  window.location.href = 'app.html?mode=demo';
}

// Global erişim
window.openModal = openModal;
window.closeModal = closeModal;
window.switchForm = switchForm;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.handleForgotPassword = handleForgotPassword;
window.handleUpdatePassword = handleUpdatePassword;
window.goToDemo = goToDemo;

// Recovery bağlantısı dinleyicisi
window.addEventListener('DOMContentLoaded', () => {
  const client = window.supabaseClient || (typeof initSupabase === 'function' ? initSupabase() : null);
  if (client) {
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        openModal('reset');
      }
    });
  }
  if (window.location.hash && (window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token'))) {
    setTimeout(() => {
      openModal('reset');
    }, 400);
  }
});

console.log('✅ Auth sistemi yüklendi');

function showEmailVerificationModal(email) {
    // Önce mevcut kayıt modalını kapat
    closeModal();
    
    // Zaten açıksa kaldır
    const existing = document.getElementById('emailVerifyModal');
    if (existing) existing.remove();
    
    // Email domain'ine göre hızlı erişim linki
    const domain = email.split('@')[1]?.toLowerCase() || '';
    let quickAccess = '';
    
    if (domain.includes('gmail')) {
        quickAccess = 'https://mail.google.com';
    } else if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) {
        quickAccess = 'https://outlook.live.com';
    } else if (domain.includes('yahoo')) {
        quickAccess = 'https://mail.yahoo.com';
    } else if (domain.includes('yandex')) {
        quickAccess = 'https://mail.yandex.com';
    } else if (domain.includes('icloud')) {
        quickAccess = 'https://www.icloud.com/mail';
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'emailVerifyModal';
    overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.8);
        display: flex; align-items: center; justify-content: center;
        z-index: 999999; padding: 20px;
        animation: fadeIn 0.3s ease;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: linear-gradient(135deg, #1e293b, #0f172a);
        border-radius: 20px; padding: 32px; max-width: 500px; width: 100%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        border: 2px solid #10b981;
        font-family: system-ui, -apple-system, sans-serif;
        color: white; text-align: center;
        max-height: 90vh; overflow-y: auto;
    `;
    
    modal.innerHTML = `
        <div style="font-size: 64px; margin-bottom: 12px;">📧</div>
        
        <h2 style="margin: 0 0 8px 0; font-size: 26px; color: #10b981;">
            Kayıt Başarılı!
        </h2>
        
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 20px 0;">
            Email adresinize doğrulama linki gönderdik:
        </p>
        
        <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3);
                    padding: 12px; border-radius: 10px; margin-bottom: 20px;
                    font-family: monospace; font-size: 14px; color: #6ee7b7; word-break: break-all;">
            ✉️ ${email}
        </div>
        
        <div style="background: rgba(245,158,11,0.1); border-left: 4px solid #f59e0b;
                    padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;
                    text-align: left;">
            <div style="font-weight: 700; color: #fbbf24; margin-bottom: 8px;">
                ⚠️ ÖNEMLİ
            </div>
            <div style="color: #fde68a; font-size: 13px; line-height: 1.5;">
                Giriş yapmadan önce email adresinizi <strong>mutlaka doğrulamanız</strong> 
                gerekiyor. Aksi halde giriş yapamazsınız.
            </div>
        </div>
        
        <div style="text-align: left; margin-bottom: 20px;">
            <div style="font-weight: 700; color: #e2e8f0; margin-bottom: 10px; font-size: 14px;">
                📌 Yapmanız Gerekenler:
            </div>
            <ol style="color: #cbd5e1; font-size: 13px; line-height: 1.7; padding-left: 20px; margin: 0;">
                <li>Email kutunuzu (gelen kutusu) kontrol edin</li>
                <li><strong style="color:#fbbf24;">Spam / Junk / İstenmeyen</strong> klasörünü de kontrol edin</li>
                <li>Emailde bulunan doğrulama linkine tıklayın</li>
                <li>Sonra giriş yapabilirsiniz</li>
            </ol>
        </div>
        
        ${quickAccess ? `
        <div style="margin-bottom: 20px;">
            <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">
                Hızlı erişim:
            </div>
            <a href="${quickAccess}" target="_blank" 
               style="display: inline-block; padding: 10px 20px; 
                      background: linear-gradient(135deg, #3b82f6, #2563eb);
                      color: white; text-decoration: none; border-radius: 8px;
                      font-weight: 600; font-size: 13px;">
                📧 Email Kutuma Git →
            </a>
        </div>
        ` : ''}
        
        <div style="display: flex; gap: 10px;">
            <button onclick="closeEmailVerifyModal()" style="
                flex: 1; padding: 14px; border-radius: 10px; border: none;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white; font-weight: 700; cursor: pointer; font-size: 15px;
                box-shadow: 0 4px 12px rgba(16,185,129,0.3);
            ">
                ✅ Anladım, Kontrol Ediyorum
            </button>
        </div>
        
        <div style="margin-top: 16px; color: #64748b; font-size: 12px;">
            💡 Doğrulama emaili gelmedi mi? Spam klasörünü kontrol edin veya 
            birkaç dakika bekleyin.
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function closeEmailVerifyModal() {
    const modal = document.getElementById('emailVerifyModal');
    if (modal) modal.remove();
    // Sonrasında login modalını aç
    setTimeout(() => {
        switchForm('login');
        openModal('login');
    }, 300);
}

window.showEmailVerificationModal = showEmailVerificationModal;
window.closeEmailVerifyModal = closeEmailVerifyModal;

function showEmailNotConfirmedModal(email) {
    const domain = email.split('@')[1]?.toLowerCase() || '';
    let quickAccess = '';
    if (domain.includes('gmail')) quickAccess = 'https://mail.google.com';
    else if (domain.includes('outlook') || domain.includes('hotmail')) quickAccess = 'https://outlook.live.com';
    else if (domain.includes('yahoo')) quickAccess = 'https://mail.yahoo.com';
    else if (domain.includes('yandex')) quickAccess = 'https://mail.yandex.com';
    
    const existing = document.getElementById('emailVerifyModal');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'emailVerifyModal';
    overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.8);
        display: flex; align-items: center; justify-content: center;
        z-index: 999999; padding: 20px;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: linear-gradient(135deg, #1e293b, #0f172a);
        border-radius: 20px; padding: 32px; max-width: 480px; width: 100%;
        border: 2px solid #f59e0b; color: white; text-align: center;
        font-family: system-ui, sans-serif;
    `;
    
    modal.innerHTML = `
        <div style="font-size: 56px; margin-bottom: 12px;">⚠️</div>
        <h2 style="margin: 0 0 12px 0; color: #f59e0b; font-size: 24px;">
            Email Doğrulanmamış
        </h2>
        <p style="color: #cbd5e1; margin-bottom: 16px;">
            <strong>${email}</strong> adresinize gönderdiğimiz doğrulama linkine 
            henüz tıklamamışsınız.
        </p>
        <div style="background: rgba(245,158,11,0.1); padding: 14px; border-radius: 8px;
                    text-align: left; margin-bottom: 20px;">
            <strong style="color: #fbbf24;">📌 Şimdi Yapın:</strong>
            <ol style="color: #fde68a; margin: 8px 0 0 20px; padding: 0; font-size: 13px; line-height: 1.7;">
                <li>Email kutunuzu açın</li>
                <li>Spam klasörünü de kontrol edin</li>
                <li>Doğrulama linkine tıklayın</li>
                <li>Sonra tekrar giriş yapmayı deneyin</li>
            </ol>
        </div>
        ${quickAccess ? `
            <a href="${quickAccess}" target="_blank" style="
                display: inline-block; padding: 12px 24px; margin-bottom: 12px;
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white; text-decoration: none; border-radius: 8px; font-weight: 600;
            ">📧 Email Kutuma Git →</a>
        ` : ''}
        <div>
            <button onclick="document.getElementById('emailVerifyModal').remove()" style="
                padding: 12px 24px; background: transparent; border: 1px solid #475569;
                color: #cbd5e1; border-radius: 8px; cursor: pointer; font-weight: 600;
                margin-top: 8px;
            ">Kapat</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// Şifre göster/gizle
function togglePasswordVisibility(btn, event) {
    if (event) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }
    const wrapper = btn ? btn.parentElement : null;
    if (!wrapper) return;
    const input = wrapper.querySelector('input');
    if (!input) return;
    
    const val = input.value;
    const isPassword = (input.type === 'password');
    input.type = isPassword ? 'text' : 'password';
    input.value = val;
    
    btn.textContent = isPassword ? '🙈' : '👁️';
    btn.setAttribute('aria-label', isPassword ? 'Şifreyi gizle' : 'Şifreyi göster');
}

window.togglePasswordVisibility = togglePasswordVisibility;
