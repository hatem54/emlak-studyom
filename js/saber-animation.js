// ============================================
// Saber Animasyon Kontrol Toggle Sistemi
// ============================================

// Ayarları localStorage'da tut
function getSaberAnimState(key) {
    return localStorage.getItem('saber_anim_' + key) === 'true';
}

function setSaberAnimState(key, value) {
    localStorage.setItem('saber_anim_' + key, value ? 'true' : 'false');
}

// Animasyon toggle checkbox'ı oluştur
function createAnimToggle(id, saberToggleId) {
    const saberToggle = document.getElementById(saberToggleId);
    if (!saberToggle) return null;
    
    // Zaten varsa oluşturma
    if (document.getElementById(id)) return document.getElementById(id);
    
    // Wrapper oluştur
    const wrapper = document.createElement('label');
    wrapper.className = 'saber-anim-toggle';
    wrapper.style.cssText = `
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 13px; color: #cbd5e1;
        cursor: pointer; user-select: none; margin: 0; padding: 0;
    `;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.checked = getSaberAnimState(id);
    checkbox.disabled = !saberToggle.checked;
    checkbox.style.cssText = 'cursor: pointer; accent-color: #f59e0b; margin:0;';
    
    const label = document.createElement('span');
    label.innerHTML = '⚡ Animasyon';
    label.style.cssText = 'font-weight: 600; line-height: 1;';
    
    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    
    // Saber toggle'ın yanına (aynı satıra) ekle (Flex Container oluşturarak)
    const saberParent = saberToggle.closest('label') || saberToggle.parentElement;
    if (saberParent && saberParent.parentElement) {
        if (!saberParent.parentElement.classList.contains('saber-anim-container')) {
            const container = document.createElement('div');
            container.className = 'saber-anim-container';
            container.style.cssText = 'display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 8px;';
            
            // Orijinal label'ın margin'lerini sıfırla ki alt alta kaymasın
            saberParent.style.marginBottom = '0';
            saberParent.style.marginTop = '0';
            
            saberParent.parentElement.insertBefore(container, saberParent);
            container.appendChild(saberParent);
            container.appendChild(wrapper);
        } else {
            saberParent.parentElement.appendChild(wrapper);
        }
    }
    
    // Değişiklik olayı
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            const userAgreed = confirm("Uyarı: Animasyon açıkken cihazınızda donma veya kasma olabilir. Devam etmek istiyor musunuz?");
            if (!userAgreed) {
                checkbox.checked = false;
                return;
            }
        }
        setSaberAnimState(id, checkbox.checked);
        applySaberAnimation(id, checkbox.checked);
    });
    
    // Saber toggle değiştiğinde bu da güncellensin
    saberToggle.addEventListener('change', () => {
        checkbox.disabled = !saberToggle.checked;
        if (saberToggle.checked && checkbox.checked) {
            applySaberAnimation(id, true);
        } else {
            applySaberAnimation(id, false);
        }
    });
    
    return checkbox;
}

// Animasyonu uygula (PIXI Ticker üzerinden)
function applySaberAnimation(id, enabled) {
    try {
        if (!window.PIXI || !window.PIXI.Ticker || !window.PIXI.Ticker.shared) return;
        
        // Global kontrol: herhangi bir animasyon açıksa çalıştır
        const textAnim = getSaberAnimState('elTextSaberAnim');
        const deAnim = getSaberAnimState('deSaberAnim');
        const modeAnim = getSaberAnimState('saberModeAnim');
        
        // Eğer dinamik eklenen varsa onları da hesaba kat
        const anyChecked = Array.from(document.querySelectorAll('.saber-anim-toggle input[type="checkbox"]')).some(cb => cb.checked);
        
        if (textAnim || deAnim || modeAnim || anyChecked) {
            window.PIXI.Ticker.shared.start();
            console.log('▶️ Saber Animasyonu AKTİF');
        } else {
            window.PIXI.Ticker.shared.stop();
            console.log('⏸️ Saber Animasyonu DURDURULDU (statik görünüm)');
        }
    } catch (e) {
        console.warn('Saber animasyon uygulanamadı:', e);
    }
}

// Sayfa yüklendiğinde toggle'ları oluştur (Demo modda kilit olabilir, kontrol et)
function initSaberAnimToggles() {
    // Element gelene kadar bekle (async yüklenebiliyor)
    const tryCreate = () => {
        // Yazı için (kesin belli)
        createAnimToggle('elTextSaberAnim', 'elTextSaber');
        
        // Ana Saber Modu için (SABER EFEKTİ accordion içindeki)
        if (document.getElementById('saberModeToggle')) {
            createAnimToggle('saberModeAnim', 'saberModeToggle');
        }
        
        // Çizim Objesi Özellikleri Saber Modu için
        if (document.getElementById('deSaberToggle')) {
            createAnimToggle('deSaberAnim', 'deSaberToggle');
        } 
        
        // Bulunamazsa DOM üzerinde geniş arama yap (yedek sistem)
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        for (const cb of allCheckboxes) {
            if (cb.id && 
                cb.id !== 'elTextSaber' && 
                cb.id !== 'saberModeToggle' && 
                cb.id !== 'deSaberToggle' && 
                !cb.id.endsWith('Anim')) {
                
                const html = (cb.outerHTML || '').toLowerCase();
                const parentHtml = (cb.parentElement ? cb.parentElement.innerHTML : '').toLowerCase();
                
                if (html.includes('saber') || html.includes('neon') || 
                    parentHtml.includes('saber') || parentHtml.includes('neon')) {
                    createAnimToggle(cb.id + 'Anim', cb.id);
                }
            }
        }
    };
    
    // İlk deneme
    tryCreate();
    
    // Panel dinamik açıldığı için periyodik dene
    setInterval(tryCreate, 2000);
    
    // İlk yüklenmede animasyon durumunu uygula (varsayılan kapalı)
    setTimeout(() => {
        applySaberAnimation('elTextSaberAnim', false);
    }, 1500);
}

// Global
window.applySaberAnimation = applySaberAnimation;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initSaberAnimToggles, 800);
});

console.log('⚡ Saber Animasyon Toggle sistemi yüklendi (Yan Yana & Dinamik ID Destekli)');
