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
  
  setTimeout(() => {
    const elTextSaber = document.getElementById('elTextSaber');
    const deSaberToggle = document.getElementById('deSaberToggle');
    
    [elTextSaber, deSaberToggle].forEach(el => {
      if (el) {
        el.disabled = true;
        el.checked = false;
        const parent = el.closest('label') || el.parentElement;
        if (parent && !parent.querySelector('.pro-lock')) {
          const lock = document.createElement('span');
          lock.className = 'pro-lock';
          lock.innerHTML = ' 🔒 Pro';
          lock.style.cssText = 'color:#f59e0b; font-size:11px; font-weight:600;';
          parent.appendChild(lock);
        }
      }
    });
  }, 500);
  
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
  
  observeTemplateGrid();
}

function observeTemplateGrid() {
  const grid = document.getElementById('templateGrid');
  if (!grid) {
    setTimeout(observeTemplateGrid, 1000);
    return;
  }
  
  const lockTemplates = () => {
    const items = grid.querySelectorAll('[data-template], .template-item, .tpl-item');
    items.forEach(item => {
      const tplName = item.dataset.template || item.dataset.tpl || item.className;
      const isAllowed = DEMO_TEMPLATES.some(allowed => 
        (tplName && tplName.includes(allowed))
      );
      
      if (!isAllowed && !item.querySelector('.pro-overlay')) {
        item.style.position = 'relative';
        const overlay = document.createElement('div');
        overlay.className = 'pro-overlay';
        overlay.style.cssText = `
          position: absolute; inset: 0; background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 700; font-size: 13px; z-index: 10;
          cursor: pointer; border-radius: 8px; text-align: center;
        `;
        overlay.innerHTML = '🔒<br>Pro';
        overlay.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          showProUpgradeToast();
        };
        item.appendChild(overlay);
      }
    });
  };
  
  lockTemplates();
  const observer = new MutationObserver(lockTemplates);
  observer.observe(grid, { childList: true, subtree: true });
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
      ctx.font = \`bold \${fontSize}px system-ui, sans-serif\`;
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
      ctx.font = \`bold \${fontSize}px system-ui, sans-serif\`;
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
