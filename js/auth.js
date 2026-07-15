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
  if (type === 'login') {
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
  } else {
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
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
  event.preventDefault();
  
  const form = document.getElementById('registerForm');
  const nameInput = form.querySelector('input[type="text"]');
  const emailInput = form.querySelector('input[type="email"]');
  const passwordInput = form.querySelector('input[type="password"]');
  
  const fullName = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  if (!fullName || !email || !password) {
    showToast('Tüm alanları doldurun', 'error');
    return;
  }
  
  if (password.length < 6) {
    showToast('Şifre en az 6 karakter olmalı', 'error');
    return;
  }
  
  const btn = form.querySelector('.btn-submit');
  const originalText = btn.textContent;
  btn.textContent = 'Kayıt yapılıyor...';
  btn.disabled = true;
  
  try {
    const { data, error } = await window.supabaseClient.auth.signUp({
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
    if (error.message.includes('already registered')) msg = 'Bu email zaten kayıtlı';
    if (error.message.includes('valid email')) msg = 'Geçerli bir email girin';
    showToast(msg, 'error');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// GİRİŞ İŞLEMİ
async function handleLogin(event) {
  event.preventDefault();
  
  const form = document.getElementById('loginForm');
  const emailInput = form.querySelector('input[type="email"]');
  const passwordInput = form.querySelector('input[type="password"]');
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  if (!email || !password) {
    showToast('Email ve şifre girin', 'error');
    return;
  }
  
  const btn = form.querySelector('.btn-submit');
  const originalText = btn.textContent;
  btn.textContent = 'Giriş yapılıyor...';
  btn.disabled = true;
  
  try {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) throw error;
    
    showToast('✅ Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
    setTimeout(() => {
      window.location.href = 'app.html?mode=pro';
    }, 1500);
    
  } catch (error) {
    console.error('Giriş hatası:', error);
    let msg = 'Giriş sırasında hata oluştu';
    if (error.message.includes('Invalid login')) msg = 'Email veya şifre hatalı';
    if (error.message.includes('Email not confirmed')) {
        showEmailNotConfirmedModal(email);
        return;
    }
    showToast(msg, 'error');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
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
window.goToDemo = goToDemo;

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

window.showEmailNotConfirmedModal = showEmailNotConfirmedModal;

// Şifre göster/gizle
function togglePasswordVisibility(btn) {
    const wrapper = btn.parentElement;
    const input = wrapper.querySelector('input');
    if (!input) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

window.togglePasswordVisibility = togglePasswordVisibility;
