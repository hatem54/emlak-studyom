// ============================================
// Demo/Pro Mod Yöneticisi
// ============================================

let APP_MODE = 'demo'; // Varsayılan Demo Modu
let CURRENT_USER = null;
const DEMO_TEMPLATES = ['tpl_klasik', 'tpl_minimal', 'tpl_dinamik'];

async function checkUserMode() {
  try {
    const { data: { session }, error } = await window.supabaseClient.auth.getSession();
    if (error) throw error;
    
    if (session && session.user) {
      CURRENT_USER = session.user;
      
      // Profil & Abonelik Bilgilerini Çek
      try {
          const { data: profile } = await window.supabaseClient
              .from('profiles')
              .select('role, full_name, email, is_banned, banned_reason, subscription_plan, subscription_expires_at')
              .eq('id', session.user.id)
              .maybeSingle();
          
          // 🚫 Ban Kontrolü
          if (profile && profile.is_banned) {
              const reason = profile.banned_reason ? `Sebep: ${profile.banned_reason}` : 'Hesabınız askıya alınmıştır.';
              if (typeof Swal !== 'undefined') {
                  await Swal.fire({
                      icon: 'error',
                      title: '🚫 Erişim Engellendi',
                      text: `Bu hesap sistem yöneticisi tarafından yasaklanmıştır. ${reason}`,
                      background: '#1e293b',
                      color: '#ffffff'
                  });
              } else {
                  alert(`🚫 Erişim Engellendi: Bu hesap yasaklanmıştır. ${reason}`);
              }
              await handleLogout();
              return 'banned';
          }

          // Son görülme tarihini güncelle
          window.supabaseClient.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', session.user.id).then().catch();

          // 🛡️ Admin Kontrolü
          if (profile && profile.role === 'admin') {
              window.IS_ADMIN = true;
              APP_MODE = 'pro';
              const adminBtn = document.getElementById('adminNavBtn');
              if (adminBtn) {
                  adminBtn.style.display = 'inline-flex';
                  adminBtn.style.alignItems = 'center';
                  adminBtn.style.gap = '6px';
              }
          } else {
              // ⏳ Abonelik / Süre Kontrolü
              window.IS_ADMIN = false;
              if (profile && profile.subscription_expires_at) {
                  const now = new Date();
                  const expiresAt = new Date(profile.subscription_expires_at);
                  const diffMs = expiresAt - now;
                  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

                  if (diffDays > 0) {
                      APP_MODE = 'pro';
                      window.PRO_DAYS_LEFT = diffDays;
                      console.log(`✅ Pro abonelik aktif (${diffDays} gün kaldı)`);
                  } else {
                      APP_MODE = 'demo';
                      window.PRO_DAYS_LEFT = 0;
                      console.log('🟡 Abonelik süresi dolmuş, Demo moda geçildi');
                  }
              } else if (profile && (profile.subscription_plan === 'pro' || profile.role === 'pro')) {
                  APP_MODE = 'pro';
                  window.PRO_DAYS_LEFT = null; // Süresiz Pro
              } else {
                  APP_MODE = 'demo'; // Standart kayıtlı kullanıcı (kodu henüz girmemiş)
                  window.PRO_DAYS_LEFT = 0;
                  console.log('🟡 Kayıtlı Demo Kullanıcı');
              }
          }
      } catch (e) {
          console.warn('Abonelik profili sorgu uyarısı:', e);
          APP_MODE = 'demo';
      }
    } else {
      APP_MODE = 'demo'; // Giriş yapılmamışsa Demo
      CURRENT_USER = null;
      console.log('🟡 Misafir / Demo Kullanıcı');
    }
  } catch (e) {
    console.warn('Mod kontrolü hatası, varsayılan demo moda geçiliyor:', e);
    APP_MODE = 'demo';
    CURRENT_USER = null;
  }
  
  // TEST MODU OVERRIDE (SADECE YEREL GELİŞTİRME ORTAMINDA AKTİF)
  const isLocalDev = (typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'file:'
  ));
  if (isLocalDev && localStorage.getItem('isDeveloper') === 'true') {
      const forcedMode = localStorage.getItem('userMode');
      if (forcedMode === 'demo' || forcedMode === 'pro') {
          APP_MODE = forcedMode;
          console.log(`🛠️ YEREL TEST MODU: Zorlanan Mod -> ${forcedMode.toUpperCase()}`);
      }
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
      position: fixed; top: 15px; left: 20px;
      background: linear-gradient(135deg, #f59e0b, #d97706); color: white;
      padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 12px;
      z-index: 99998; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      display: flex; align-items: center; gap: 8px;
    `;
    bannerDiv.innerHTML = `
        <span>🟡 Demo Modu</span>
        <button onclick="if(window.openRedeemCodeModal) window.openRedeemCodeModal()" style="background:#10b981; color:white; border:none; padding:3px 8px; border-radius:10px; font-size:11px; font-weight:bold; cursor:pointer;" title="Aktivasyon / Promosyon Kodu Gir">🔑 Kod Gir</button>
        <span onclick="window.location.href='index.html#pricing'" style="text-decoration:underline; cursor:pointer; opacity:0.9;">Satın Al</span>
    `;
    document.body.appendChild(bannerDiv);
  } else {
    bannerDiv.style.cssText = `
      position: fixed; top: 15px; left: 20px;
      background: linear-gradient(135deg, #10b981, #059669); color: white;
      padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 12px;
      z-index: 99998; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      display: flex; align-items: center; gap: 8px;
    `;
    const userName = CURRENT_USER?.user_metadata?.full_name || CURRENT_USER?.email || 'Kullanıcı';
    
    if (window.IS_ADMIN) {
      bannerDiv.style.background = 'linear-gradient(135deg, #8b5cf6, #6d28d9)';
      bannerDiv.innerHTML = `<span onclick="window.location.href='admin.html'" style="cursor:pointer;" title="Admin Paneline Git">🛡️ Admin • ${userName}</span> <span id="logoutBtn" style="margin-left:8px; cursor:pointer; opacity:0.8; text-decoration:underline;">Çıkış</span>`;
    } else {
      const daysText = (typeof window.PRO_DAYS_LEFT === 'number' && window.PRO_DAYS_LEFT > 0) ? ` (${window.PRO_DAYS_LEFT} gün)` : '';
      bannerDiv.innerHTML = `
          <span>✨ Pro${daysText} • ${userName}</span>
          <button onclick="if(window.openRedeemCodeModal) window.openRedeemCodeModal()" style="background:rgba(255,255,255,0.2); color:white; border:none; padding:2px 8px; border-radius:10px; font-size:10px; cursor:pointer;" title="Süreyi Uzat / Kod Gir">🔑 Kod Gir</button>
          <span id="logoutBtn" style="margin-left:6px; cursor:pointer; opacity:0.8; text-decoration:underline;">Çıkış</span>
      `;
    }
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
    if (typeof window.updateExportScaleDisplay === 'function') {
      window.updateExportScaleDisplay();
    }
  }, 500);
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
    const cards = document.querySelectorAll('.canva-tpl-card:not(.pro-tpl-card):not(.pro-json-card)');
    
    // Debug: Bulunan tüm kartların data-id'sini yaz (İLK KEZ)
    if (!window._templatesLogged) {
        const allIds = Array.from(cards).map(c => c.dataset.id || 'noId');
        console.log('🔍 Bulunan şablon ID leri (canva-tpl-card):', allIds);
        window._templatesLogged = true;
    }
    
    cards.forEach(card => {
      if (card.classList.contains('pro-tpl-card') || card.classList.contains('pro-json-card')) return;
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

// ============================================
// Dışa Aktarma & İndirme Güvenlik / Yetki Kontrolü
// ============================================
function validateExportAllowed() {
  if (APP_MODE === 'pro') return { allowed: true };

  // 1. Kalite / Çözünürlük Kontrolü (1x ve altı serbest, 1.5x 2K, 2x 4K kilitli)
  const exportScale = document.getElementById('exportScale');
  if (exportScale && parseFloat(exportScale.value) > 1.0) {
      return {
          allowed: false,
          title: '🔒 Yüksek Çözünürlük (Ultra HD / 4K)',
          message: 'Seçtiğiniz <strong>1.5x (2K) / 2x (Ultra HD 4K)</strong> yüksek çözünürlüklü indirme seçeneği Pro üyelere aittir.<br><br>👉 <strong>Ücretsiz İndirmek İçin:</strong> Kalite kutusundan <strong>1x (Standart 1080p)</strong> seçeneğini seçerek filigranlı indirebilirsiniz.'
      };
  }

  // 2. Şablon Kontrolü (Sadece Klasik, Dinamik, Minimal serbest)
  const cvrBase = document.querySelector('.cvr-base, .canva-panel');
  if (cvrBase) {
      const activeCard = document.querySelector('.canva-tpl-card.active, .template-btn.active');
      if (activeCard) {
          const dataId = activeCard.dataset.id || activeCard.id || '';
          const match = dataId.match(/^canva([A-Z]|[0-9])/);
          let prefix = match ? match[1] : null;
          if (prefix && /[0-9]/.test(prefix)) prefix = 'NUM';
          
          const isAllowed = prefix && DEMO_TEMPLATE_PREFIXES.includes(prefix);
          if (!isAllowed && dataId && dataId !== 'empty' && dataId !== 'none') {
              const tplName = (activeCard.querySelector('.tpl-name')?.textContent || activeCard.textContent || 'Özel Şablon').trim();
              return {
                  allowed: false,
                  title: '🔒 Pro Şablon Kullanımı',
                  message: `Tasarımınızda kullanılan <strong>"${tplName}"</strong> şablonu Pro sürüme aittir.<br><br>👉 <strong>Ücretsiz İndirmek İçin:</strong> Şablonlar menüsünden <strong>Klasik</strong>, <strong>Minimal</strong> veya <strong>Dinamik</strong> şablonlarından birini seçebilirsiniz.`
              };
          }
      }
  }

  // 3. Saber Neon Işık Efekti Kontrolü
  if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
      const saberApp = window.SaberEngine.getApp();
      if (saberApp && window.SaberEngine.lines && window.SaberEngine.lines.length > 0) {
          return {
              allowed: false,
              title: '🔒 Saber Neon Işık Efekti',
              message: 'Tasarımınızda <strong>Saber Neon Işık Efekti</strong> bulunmaktadır. Bu özellik Pro üyelere aittir.<br><br>👉 <strong>Ücretsiz İndirmek İçin:</strong> Işık efektini kaldırıp tekrar indirmeyi deneyin.'
          };
      }
  }

  // Tüm formatlar (16:9, 1:1, 9:16, Afiş, Sahibinden, Orijinal vb.) Demo'da açıktır ve filigranlı iner
  return { allowed: true };
}

// ============================================
// Logo & Marka Filigranı (Watermark)
// ============================================
function addWatermark(canvas) {
  return new Promise(async (resolve) => {
    if (APP_MODE === 'pro') {
      resolve(canvas);
      return;
    }
    
    // Kıvrımlı şık yazı tipini yükle
    try {
      if (document.fonts && document.fonts.load) {
        await document.fonts.load('bold 28px "Dancing Script"');
      }
    } catch(e){}

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // 1. Ortada Çapraz Yarı-Şeffaf Filigran
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-22 * Math.PI / 180);
    const centerFontSize = Math.max(28, Math.round(W / 24));
    ctx.font = `800 ${centerFontSize}px 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = Math.max(2, Math.round(centerFontSize / 14));
    ctx.strokeText('EmlakStudyom.com', 0, 0);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillText('EmlakStudyom.com', 0, 0);
    ctx.restore();

    // 2. Sağ Alt Köşede Büyük Sade Logo ve Bitişik Kıvrımlı Yazı
    const logo = new Image();
    logo.crossOrigin = 'anonymous';

    const drawBottomRightBrand = (logoImg) => {
        ctx.save();

        const padding = Math.max(20, Math.round(W * 0.015));
        const logoSize = Math.max(80, Math.round(W * 0.065)); // Belirgin büyük logo
        const fontSize = Math.max(18, Math.round(W * 0.013)); // Zarif ve kibar yazı
        const gap = -Math.round(logoSize * 0.18); // PNG içi boşlukları sıfırlayıp logoya tam yapıştır

        ctx.font = `bold italic ${fontSize}px 'Dancing Script', 'Parisienne', 'Great Vibes', 'Caveat', cursive, sans-serif`;
        const textStr = 'EmlakStudyom.com';
        const textMetrics = ctx.measureText(textStr);
        const textWidth = textMetrics.width;
        const totalWidth = (logoImg ? (logoSize + gap) : 0) + textWidth;

        const startX = W - totalWidth - padding;
        const centerY = H - padding - (logoSize / 2);

        // Şık gölge
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // 1. Logo Çizimi
        if (logoImg && logoImg.width > 0) {
            ctx.globalAlpha = 0.92;
            ctx.drawImage(logoImg, startX, centerY - (logoSize / 2), logoSize, logoSize);
        }

        // 2. Bitişik Kıvrımlı Yazı Çizimi
        const textX = logoImg ? (startX + logoSize + gap) : startX;
        const textY = centerY + 2;

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // İnce kontur ve parlak dolgu
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.lineWidth = 1.8;
        ctx.strokeText(textStr, textX, textY);

        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.95;
        ctx.fillText(textStr, textX, textY);

        ctx.restore();
        resolve(canvas);
    };

    logo.onload = () => drawBottomRightBrand(logo);
    logo.onerror = () => drawBottomRightBrand(null);
    logo.src = 'assets/logo/logo-icon.png';
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
window.validateExportAllowed = validateExportAllowed;
window.addWatermark = addWatermark;
window.handleLogout = handleLogout;
window.showProUpgradeToast = showProUpgradeToast;

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(checkUserMode, 300);
});

console.log('✅ Mode Manager yüklendi');


