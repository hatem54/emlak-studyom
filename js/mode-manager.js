// ============================================
// Demo/Pro Mod Yöneticisi
// ============================================

let APP_MODE = 'demo';
let CURRENT_USER = null;
const DEMO_TEMPLATES = ['tpl_klasik', 'tpl_minimal', 'tpl_dinamik'];

async function checkUserMode() {
  try {
    const { data: { session }, error } = await window.supabaseClient.auth.getSession();
    if (error) throw error;
    
    if (session && session.user && session.user.email_confirmed_at) {
      APP_MODE = 'pro';
      CURRENT_USER = session.user;
      console.log('✅ Pro modu aktif:', session.user.email);
    } else {
      APP_MODE = 'demo';
      CURRENT_USER = null;
      console.log('🟡 Demo modu aktif (kayıtsız)');
    }
  } catch (e) {
    console.warn('Mod kontrolü hatası, demo moda geçiliyor:', e);
    APP_MODE = 'demo';
    CURRENT_USER = null;
  }
  
  applyModeRestrictions();
  updateModeUI();
  return APP_MODE;
}

function updateModeUI() {
  const banner = document.getElementById('modeBanner');
  if (banner) banner.remove();
  
  const bannerDiv = document.createElement('div');
  bannerDiv.id = 'modeBanner';
  
  if (APP_MODE === 'demo') {
    bannerDiv.style.cssText = `
      position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #f59e0b, #d97706); color: white;
      padding: 8px 20px; border-radius: 20px; font-weight: 600; font-size: 13px;
      z-index: 99998; box-shadow: 0 4px 12px rgba(0,0,0,0.2); cursor: pointer;
      display: flex; align-items: center; gap: 10px;
    `;
    bannerDiv.innerHTML = "🟡 Demo Modu • <span style=\"text-decoration:underline\">Pro'ya Yükselt</span>";
    bannerDiv.onclick = () => { window.location.href = 'index.html#pricing'; };
    document.body.appendChild(bannerDiv);
  } else {
    bannerDiv.style.cssText = `
      position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #10b981, #059669); color: white;
      padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 12px;
      z-index: 99998; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      display: flex; align-items: center; gap: 8px;
    `;
    const userName = CURRENT_USER?.user_metadata?.full_name || CURRENT_USER?.email || 'Kullanıcı';
    bannerDiv.innerHTML = `✨ Pro • ${userName} <span id="logoutBtn" style="margin-left:8px; cursor:pointer; opacity:0.8; text-decoration:underline;">Çıkış</span>`;
    document.body.appendChild(bannerDiv);
    setTimeout(() => {
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) logoutBtn.onclick = handleLogout;
    }, 100);
  }
}

function applyModeRestrictions() {
  if (APP_MODE === 'pro') return;
  
  // Saber kilitlerini periyodik uygula (element dinamik gelir)
  const lockSaberElements = () => {
      // Tüm Saber ile ilgili checkbox'ları bul (id veya class ile)
      const findSaberInputs = () => {
          const inputs = [];
          // ID'ye göre ara
          ['elTextSaber', 'deSaberToggle', 'saberToggle', 'drawSaber'].forEach(id => {
              const el = document.getElementById(id);
              if (el) inputs.push(el);
          });
          // Class veya name'e göre ara
          document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
              const id = (cb.id || '').toLowerCase();
              const name = (cb.name || '').toLowerCase();
              const parentText = (cb.closest('label')?.textContent || '').toLowerCase();
              if (id.includes('saber') || name.includes('saber') || 
                  parentText.includes('saber') || parentText.includes('neon')) {
                  if (!inputs.includes(cb)) inputs.push(cb);
              }
          });
          return inputs;
      };

      const saberInputs = findSaberInputs();
      saberInputs.forEach(el => {
          if (el && !el.dataset.proLocked) {
              el.disabled = true;
              el.checked = false;
              el.dataset.proLocked = 'true';
              
              const parent = el.closest('label') || el.parentElement;
              if (parent && !parent.querySelector('.pro-lock')) {
                  const lock = document.createElement('span');
                  lock.className = 'pro-lock';
                  lock.innerHTML = ' 🔒 Pro';
                  lock.style.cssText = 'color:#f59e0b; font-size:11px; font-weight:600; margin-left:4px;';
                  parent.appendChild(lock);
              }
              
              // Tıklamayı engelle ve toast göster
              el.addEventListener('click', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  showProUpgradeToast();
                  return false;
              }, true);
          }
      });
  };

  lockSaberElements();
  setInterval(lockSaberElements, 2000); // Her 2 saniyede kontrol et
  
  setTimeout(() => {
    const exportScale = document.getElementById('exportScale');
    if (exportScale) {
      Array.from(exportScale.options).forEach(opt => {
        const val = parseFloat(opt.value);
        if (val > 0.75) {
          opt.disabled = true;
          if (!opt.textContent.includes('🔒')) {
            opt.textContent = opt.textContent + ' 🔒 Pro';
          }
        }
      });
      if (parseFloat(exportScale.value) > 0.75) {
        exportScale.value = '0.75';
      }
    }
  }, 500);
  
  // FORMAT KİLİTLEME - Sadece varsayılan 1920x1080 açık
  setTimeout(() => {
      const lockFormats = () => {
          // Format seçimi genelde select veya button grubu olur
          // Olası ID'ler: canvasFormat, formatSelect, aspectRatio
          const formatSelectors = document.querySelectorAll('select[id*="ormat"], select[id*="spect"], select[id*="anvas"]');
          formatSelectors.forEach(sel => {
              Array.from(sel.options).forEach(opt => {
                  const text = opt.textContent.toLowerCase();
                  const val = opt.value.toLowerCase();
                  // 1920x1080 veya "varsayılan" veya "default" içerenler açık
                  const isDefault = text.includes('1920×1080') || text.includes('1920x1080') || 
                                   (text.includes('1920') && text.includes('1080'));
                  if (!isDefault && !opt.disabled) {
                      opt.disabled = true;
                      if (!opt.textContent.includes('🔒')) {
                          opt.textContent = opt.textContent + ' 🔒 Pro';
                      }
                  }
              });
          });
          
          // Buton grubu format seçimi (varsa)
          const formatButtons = document.querySelectorAll('[data-format], [data-ratio], .format-btn, .aspect-btn');
          formatButtons.forEach(btn => {
              const format = btn.dataset.format || btn.dataset.ratio || btn.textContent;
              const isDefault = format && (format.includes('1920×1080') || format.includes('1920x1080') || 
                                          (format.includes('1920') && format.includes('1080')));
              if (!isDefault && !btn.querySelector('.format-lock')) {
                  btn.style.position = 'relative';
                  btn.style.opacity = '0.5';
                  const lock = document.createElement('span');
                  lock.className = 'format-lock';
                  lock.innerHTML = ' 🔒';
                  lock.style.cssText = 'margin-left:4px; color:#f59e0b;';
                  btn.appendChild(lock);
                  
                  btn.addEventListener('click', (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      showProUpgradeToast();
                      return false;
                  }, true);
              }
          });
      };
      
      lockFormats();
      setInterval(lockFormats, 3000);
  }, 800);

  observeTemplateGrid();
}

// Demo'da açık olacak şablon prefix'leri
// C=Klasik, D=Dinamik, M=Minimal
// KİLİTLİ: K=Kurumsal, O=Özel, P=Portföy, S=Sosyal, L=Lüks, E=Elit, Ko=Kolaj
const DEMO_TEMPLATE_PREFIXES = ['C', 'D', 'M'];

// Not: Lüks, Kolaj ve Elit(NUM) KİLİTLİ, Klasik(C), Dinamik(D), Minimal(M) AÇIK

function observeTemplateGrid() {
  const lockAllTemplates = () => {
    // 1. canva-tpl-card olanlar (Klasik, Dinamik, Minimal, Kurumsal, Özel, Portföy, Sosyal, Elit)
    const cards = document.querySelectorAll('.canva-tpl-card');
    
    // Debug: Bulunan tüm kartların data-id'sini yaz (İLK KEZ)
    if (!window._templatesLogged) {
        const allIds = Array.from(cards).map(c => c.dataset.id || 'noId');
        console.log('🔍 Bulunan şablon ID leri (canva-tpl-card):', allIds);
        window._templatesLogged = true;
    }
    
    cards.forEach(card => {
      const dataId = card.dataset.id || '';
      // Prefix'i bul (canvaC1 -> C, canvaK5 -> K, canva1 -> "NUM")
      const match = dataId.match(/^canva([A-Z]|[0-9])/);
      let prefix = match ? match[1] : null;

      // Sayısal ID'ler (canva1, canva2 vs.) NUM olarak işaretle
      if (prefix && /[0-9]/.test(prefix)) {
          prefix = 'NUM'; // Elit şablonları
      }

      const isAllowed = prefix && DEMO_TEMPLATE_PREFIXES.includes(prefix);

      // Debug: engellenen ID'yi logla (sadece bir kez)
      if (!isAllowed && !window._lockedLogged) {
          console.log('🔒 Kilitlenen ID örneği:', dataId, 'prefix:', prefix);
          window._lockedLogged = true;
      }
      
      if (!isAllowed && !card.querySelector('.pro-overlay')) {
        card.style.position = 'relative';
        const overlay = document.createElement('div');
        overlay.className = 'pro-overlay';
        overlay.style.cssText = `
          position: absolute; inset: 0; background: rgba(0,0,0,0.75);
          display: flex; flex-direction: column; align-items: center; 
          justify-content: center; color: white; font-weight: 700; 
          font-size: 16px; z-index: 100; cursor: pointer; 
          border-radius: 6px; text-align: center; gap: 4px;
        `;
        overlay.innerHTML = '<div style="font-size:24px">🔒</div><div style="font-size:11px">Pro</div>';
        overlay.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          showProUpgradeToast();
        };
        card.appendChild(overlay);
      }
    });

    // 2. template-btn olanlar (Lüks, Kolaj ve Boş Sayfa)
    const btnCards = document.querySelectorAll('.template-btn');
    btnCards.forEach(btn => {
        // Boş Sayfa'yı her zaman es geç
        if (btn.id === 'tpl-empty' || btn.textContent.includes('Boş Sayfa')) return;
        
        // Eğer Buton Lüks veya Kolaj grid'inin içindeyse kilitle
        const isLuks = btn.closest('#tpl-content-luks') || btn.closest('#luksTemplateGrid');
        const isKolaj = btn.closest('#tpl-content-kolaj') || btn.closest('#kolajGrid');
        
        if ((isLuks || isKolaj) && !btn.querySelector('.pro-lock')) {
            btn.style.position = 'relative';
            btn.style.opacity = '0.6';
            const lock = document.createElement('span');
            lock.className = 'pro-lock';
            lock.innerHTML = '🔒 PRO';
            lock.style.position = 'absolute';
            lock.style.right = '5px';
            lock.style.top = '5px';
            lock.style.fontSize = '10px';
            lock.style.background = '#dc2626';
            lock.style.color = '#fff';
            lock.style.padding = '2px 6px';
            lock.style.borderRadius = '4px';
            lock.style.pointerEvents = 'none'; // Kilit etiketinin tıklamayı engellememesi için
            btn.appendChild(lock);
            
            // Tıklamayı engelle
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showProUpgradeToast();
            }, true);
        }
    });
  };
  
  lockAllTemplates();
  
  // Body'de değişiklik olduğunda kilitleri tekrar uygula (dinamik yükleme için)
  const observer = new MutationObserver(() => {
    lockAllTemplates();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function showProUpgradeToast() {
  const existing = document.getElementById('proToast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.id = 'proToast';
  toast.style.cssText = `
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white;
    padding: 16px 28px; border-radius: 12px; font-size: 14px; font-weight: 600;
    z-index: 999999; box-shadow: 0 8px 24px rgba(0,0,0,0.3); cursor: pointer;
    display: flex; align-items: center; gap: 12px;
  `;
  toast.innerHTML = '🔒 Bu özellik Pro üyelere özeldir. <span style="text-decoration:underline">Ücretsiz Kayıt Ol →</span>';
  toast.onclick = () => { window.location.href = 'index.html#pricing'; };
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// Logo watermark - Promise döndürür (async için)
function addWatermark(canvas) {
  return new Promise((resolve) => {
    if (APP_MODE === 'pro') {
      resolve(canvas);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    
    logo.onload = () => {
      const logoWidth = Math.max(80, canvas.width * 0.12);
      const logoHeight = (logo.height / logo.width) * logoWidth;
      const padding = 20;
      const x = canvas.width - logoWidth - padding;
      const y = canvas.height - logoHeight - padding;
      
      ctx.globalAlpha = 0.85;
      ctx.drawImage(logo, x, y, logoWidth, logoHeight);
      
      ctx.globalAlpha = 0.7;
      const fontSize = Math.max(10, Math.floor(canvas.width / 80));
      ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 2;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      const textY = y + logoHeight + fontSize + 8;
      ctx.strokeText('emlakstudyom.com', canvas.width - padding, textY);
      ctx.fillText('emlakstudyom.com', canvas.width - padding, textY);
      
      ctx.globalAlpha = 1;
      resolve(canvas);
    };
    
    logo.onerror = () => {
      const fontSize = Math.max(16, Math.floor(canvas.width / 40));
      ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 2;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.strokeText('emlakstudyom.com', canvas.width - 20, canvas.height - 20);
      ctx.fillText('emlakstudyom.com', canvas.width - 20, canvas.height - 20);
      resolve(canvas);
    };
    
    logo.src = 'assets/logo/logo.jpg';
  });
}

async function handleLogout() {
  try {
    await window.supabaseClient.auth.signOut();
    window.location.href = 'index.html';
  } catch (e) {
    console.error('Çıkış hatası:', e);
  }
}

window.APP_MODE = APP_MODE;
window.CURRENT_USER = CURRENT_USER;
window.checkUserMode = checkUserMode;
window.addWatermark = addWatermark;
window.handleLogout = handleLogout;
window.showProUpgradeToast = showProUpgradeToast;

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(checkUserMode, 300);
});

console.log('✅ Mode Manager yüklendi');
