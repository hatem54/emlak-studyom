// ============================================
// EmlakStüdyom - Kayıt/Giriş Sistemi
// ============================================

// Modal açma/kapama
function openModal(type) {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.style.display = 'flex';
    switchForm(type);
  }
}

function closeModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'none';
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
    
    showToast('✅ Kayıt başarılı! Email adresinize doğrulama linki gönderildi.', 'success');
    setTimeout(() => {
      closeModal();
      switchForm('login');
      openModal('login');
    }, 2000);
    
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
    if (error.message.includes('Email not confirmed')) msg = 'Email adresinizi doğrulayın (posta kutunuzu kontrol edin)';
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
