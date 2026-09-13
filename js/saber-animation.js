// ============================================
// Neon & Saber Canlı Animasyon Motoru ve Toggle Sistemi
// ============================================

// Ayarları localStorage'da tut
function getSaberAnimState(key) {
    return localStorage.getItem('saber_anim_' + key) === 'true';
}

function setSaberAnimState(key, value) {
    localStorage.setItem('saber_anim_' + key, value ? 'true' : 'false');
}

// ══════════════════════════════════════════════
// 1. ÖZEL IN-APP MODAL PENCERESİ (CONFIRM YERİNE)
// ══════════════════════════════════════════════
function showSaberAnimModal(options = {}) {
    const existing = document.getElementById('saber-anim-modal-root');
    if (existing) existing.remove();

    const root = document.createElement('div');
    root.id = 'saber-anim-modal-root';
    root.className = 'saber-anim-modal-backdrop';

    root.innerHTML = `
        <div class="saber-anim-modal-card" role="dialog" aria-modal="true">
            <div class="saber-anim-modal-header">
                <div class="saber-anim-modal-title">
                    <span class="saber-anim-modal-icon">⚡</span>
                    <span>Canlı Neon Animasyonu</span>
                </div>
                <button type="button" class="saber-anim-modal-close" id="saberAnimModalClose" title="Kapat">&times;</button>
            </div>
            
            <div class="saber-anim-modal-body">
                <p>Canlı neon animasyonu açıldığında çizimler üzerinde <strong>elektrik akışı, titreşim ve parıltı nabzı</strong> simülasyonu çalıştırılır.</p>
                <div class="saber-anim-modal-warning">
                    ⚠️ <span>Sürekli GPU ve işlemci hesaplaması gerektirdiğinden eski veya düşük donanımlı cihazlarda performans düşüşü yaşanabilir.</span>
                </div>
                
                <label class="saber-anim-modal-remember">
                    <input type="checkbox" id="saberAnimRememberChoice">
                    <span>Bu tercihi hatırla (Bir daha sorma)</span>
                </label>
            </div>
            
            <div class="saber-anim-modal-footer">
                <button type="button" class="saber-anim-btn-cancel" id="saberAnimModalCancel">Vazgeç</button>
                <button type="button" class="saber-anim-btn-confirm" id="saberAnimModalConfirm">
                    <span>⚡ Animasyonu Başlat</span>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(root);

    requestAnimationFrame(() => {
        root.classList.add('show');
    });

    const close = () => {
        root.classList.remove('show');
        setTimeout(() => root.remove(), 220);
    };

    const confirmBtn = root.querySelector('#saberAnimModalConfirm');
    const cancelBtn = root.querySelector('#saberAnimModalCancel');
    const closeBtn = root.querySelector('#saberAnimModalClose');
    const rememberCb = root.querySelector('#saberAnimRememberChoice');

    const handleConfirm = () => {
        const remember = rememberCb ? rememberCb.checked : false;
        close();
        if (typeof options.onConfirm === 'function') {
            options.onConfirm(remember);
        }
    };

    const handleCancel = () => {
        close();
        if (typeof options.onCancel === 'function') {
            options.onCancel();
        }
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleCancel);

    root.addEventListener('click', (e) => {
        if (e.target === root) handleCancel();
    });

    const onKey = (e) => {
        if (e.key === 'Escape') {
            document.removeEventListener('keydown', onKey);
            handleCancel();
        }
    };
    document.addEventListener('keydown', onKey);
}

// Animasyon toggle olaylarını bağla
function bindAnimToggleEvents(checkbox, id, controlToggle) {
    if (!checkbox) return;
    if (checkbox.dataset.bound === 'true') {
        if (controlToggle) checkbox.disabled = !controlToggle.checked;
        return;
    }
    checkbox.dataset.bound = 'true';
    checkbox.checked = getSaberAnimState(id);
    if (controlToggle) {
        checkbox.disabled = !controlToggle.checked;
        controlToggle.addEventListener('change', () => {
            checkbox.disabled = !controlToggle.checked;
            if (controlToggle.checked && checkbox.checked) {
                applySaberAnimation(id, true);
            } else {
                applySaberAnimation(id, false);
            }
        });
    }

    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            // Kullanıcı daha önce "bir daha sorma" demişse doğrudan aç
            if (localStorage.getItem('saber_anim_confirmed') === 'true') {
                setSaberAnimState(id, true);
                applySaberAnimation(id, true);
                return;
            }

            // Onay penceresi açılana kadar checkbox'ı geri al
            checkbox.checked = false;

            showSaberAnimModal({
                onConfirm: (remember) => {
                    if (remember) {
                        localStorage.setItem('saber_anim_confirmed', 'true');
                    }
                    checkbox.checked = true;
                    setSaberAnimState(id, true);
                    applySaberAnimation(id, true);
                },
                onCancel: () => {
                    checkbox.checked = false;
                    setSaberAnimState(id, false);
                    applySaberAnimation(id, false);
                }
            });
        } else {
            setSaberAnimState(id, false);
            applySaberAnimation(id, false);
        }
    });
}

// Animasyon toggle checkbox'ı oluştur veya bağla
function createAnimToggle(id, saberToggleId, controlToggleId) {
    const saberToggle = document.getElementById(saberToggleId);
    const controlToggle = controlToggleId ? (document.getElementById(controlToggleId) || saberToggle) : saberToggle;
    
    // HTML'de statik tanımlı ise sadece olaylarını bağla
    let checkbox = document.getElementById(id);
    if (checkbox) {
        bindAnimToggleEvents(checkbox, id, controlToggle);
        return checkbox;
    }
    
    if (!saberToggle) return null;
    
    // Wrapper oluştur (Dinamik oluşturulanlar için)
    const wrapper = document.createElement('label');
    wrapper.className = 'saber-anim-toggle';
    wrapper.style.cssText = `
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 13px; color: var(--text-color, #cbd5e1);
        cursor: pointer; user-select: none; margin: 0; padding: 0;
    `;
    
    checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.style.cssText = 'cursor: pointer; accent-color: #f59e0b; margin:0; width:15px; height:15px;';
    
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
            
            saberParent.style.marginBottom = '0';
            saberParent.style.marginTop = '0';
            
            saberParent.parentElement.insertBefore(container, saberParent);
            container.appendChild(saberParent);
            container.appendChild(wrapper);
        } else {
            saberParent.parentElement.appendChild(wrapper);
        }
    }
    
    bindAnimToggleEvents(checkbox, id, controlToggle);
    return checkbox;
}

// ══════════════════════════════════════════════
// 3. CANLI SVG & PIXI NEON ANİMASYON MOTORU
// ══════════════════════════════════════════════
let _neonAnimRAF = null;
let _neonAnimTime = 0;

function runNeonSvgAnimationLoop() {
    _neonAnimTime += 0.05;
    
    const neonDrawings = document.querySelectorAll('.editable-draw');
    
    neonDrawings.forEach(el => {
        const svg = el.querySelector('svg');
        if (!svg) return;
        
        // Sadece neon aktif olanları veya neon filtresi içerenleri canlandır
        const filter = svg.querySelector('filter[id^="neon-bloom-"]');
        const glowStroke = svg.querySelector('.neon-glow-stroke');
        if (!filter && !glowStroke) return;
        
        el.classList.add('neon-animated');
        
        // 1. feGaussianBlur stdDeviation modülasyonu (Pulsing Bloom)
        if (filter) {
            const blurs = filter.querySelectorAll('feGaussianBlur');
            if (blurs.length >= 3) {
                if (!svg.dataset.baseDev1) {
                    svg.dataset.baseDev1 = blurs[0].getAttribute('stdDeviation') || '24';
                    svg.dataset.baseDev2 = blurs[1].getAttribute('stdDeviation') || '10';
                    svg.dataset.baseDev3 = blurs[2].getAttribute('stdDeviation') || '3.5';
                }
                const b1 = parseFloat(svg.dataset.baseDev1);
                const b2 = parseFloat(svg.dataset.baseDev2);
                const b3 = parseFloat(svg.dataset.baseDev3);
                
                // Yumuşak ve doğal nefes alma (agresif yanıp sönme yok)
                const pulse = 1 + Math.sin(_neonAnimTime * 2) * 0.05;
                const factor = pulse;
                
                blurs[0].setAttribute('stdDeviation', (b1 * factor).toFixed(1));
                blurs[1].setAttribute('stdDeviation', (b2 * factor).toFixed(1));
                blurs[2].setAttribute('stdDeviation', (b3 * factor).toFixed(1));
            }
        }
        
        // 2. Akkor Çekirdek (Hot Core) mikro elektrik titreşimi
        const core = svg.querySelector('.neon-hot-core');
        if (core) {
            if (Math.random() < 0.08) {
                core.setAttribute('opacity', (0.72 + Math.random() * 0.26).toFixed(2));
            } else {
                core.setAttribute('opacity', '0.95');
            }
        }
        
        // 3. Enerji Düğümleri (Node Halos) parıltı dalgalanması
        const halos = svg.querySelectorAll('.neon-node-halo');
        if (halos.length > 0) {
            const haloPulse = 0.65 + Math.sin(_neonAnimTime * 5) * 0.25;
            halos.forEach(h => h.setAttribute('opacity', haloPulse.toFixed(2)));
        }
    });

    _neonAnimRAF = requestAnimationFrame(runNeonSvgAnimationLoop);
}

function stopNeonSvgAnimationLoop() {
    if (_neonAnimRAF) {
        cancelAnimationFrame(_neonAnimRAF);
        _neonAnimRAF = null;
    }
    
    // Filtreleri ve stilleri temiz statik durumlarına döndür
    document.querySelectorAll('.editable-draw').forEach(el => {
        el.classList.remove('neon-animated');
        const svg = el.querySelector('svg');
        if (!svg) return;
        
        if (svg.dataset.baseDev1) {
            const filter = svg.querySelector('filter[id^="neon-bloom-"]');
            if (filter) {
                const blurs = filter.querySelectorAll('feGaussianBlur');
                if (blurs[0]) blurs[0].setAttribute('stdDeviation', svg.dataset.baseDev1);
                if (blurs[1]) blurs[1].setAttribute('stdDeviation', svg.dataset.baseDev2);
                if (blurs[2]) blurs[2].setAttribute('stdDeviation', svg.dataset.baseDev3);
            }
        }
        
        const core = svg.querySelector('.neon-hot-core');
        if (core) core.setAttribute('opacity', '0.95');
        
        const halos = svg.querySelectorAll('.neon-node-halo');
        halos.forEach(h => h.setAttribute('opacity', '0.8'));
    });
}

// ══════════════════════════════════════════════
// 4. ANİMASYON DURUMUNU UYGULA
// ══════════════════════════════════════════════
window.isSaberAnimationActive = function() {
    const bottomAnim = document.getElementById('saberEnergyNodesAnim');
    if (bottomAnim && bottomAnim.checked) return true;
    const toggles = document.querySelectorAll('.saber-anim-toggle input[type="checkbox"], input[id$="Anim"]');
    if (toggles.length === 0) return false;
    return Array.from(toggles).some(cb => cb.checked);
};

function applySaberAnimation(id, enabled) {
    try {
        const shouldAnimate = window.isSaberAnimationActive();
        
        if (shouldAnimate) {
            // 1. Pixi ticker'ı başlat (varsa)
            if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
                const app = window.SaberEngine.getApp();
                if (app && app.ticker && !app.ticker.started) app.ticker.start();
            }
            if (window.PIXI && window.PIXI.Ticker && window.PIXI.Ticker.shared && !window.PIXI.Ticker.shared.started) {
                window.PIXI.Ticker.shared.start();
            }
            
            // Eğer çizimlerde neon aktif olan varsa WebGL Saber'a bağla
            if (typeof drawPaths !== 'undefined' && window.applySaberToPath) {
                drawPaths.forEach((p, idx) => {
                    if ((p.hasSaber || p.saber) && !p.saberRef) {
                        window.applySaberToPath(idx, p.saberOptions || window.saberState);
                    }
                });
            }
            
            // 2. SVG Canlı Neon Animasyon döngüsünü başlat
            if (!_neonAnimRAF) {
                runNeonSvgAnimationLoop();
            }
            
            document.body.classList.add('saber-animation-active');
            console.log('▶️ Canlı After Effects Saber Animasyonu AKTİF');
        } else {
            // 1. Pixi ticker'ı durdur
            if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
                const app = window.SaberEngine.getApp();
                if (app && app.ticker && app.ticker.started) app.ticker.stop();
            }
            if (window.PIXI && window.PIXI.Ticker && window.PIXI.Ticker.shared && window.PIXI.Ticker.shared.started) {
                window.PIXI.Ticker.shared.stop();
            }
            
            // 2. SVG Canlı Neon Animasyon döngüsünü durdur
            stopNeonSvgAnimationLoop();
            
            document.body.classList.remove('saber-animation-active');
            console.log('⏸️ Canlı Neon Animasyonu DURDURULDU (statik mod)');
        }
    } catch (e) {
        console.warn('Neon animasyon uygulanamadı:', e);
    }
}

// ══════════════════════════════════════════════
// 5. CSS STİLLERİNİ ENJEKTE ET
// ══════════════════════════════════════════════
function injectSaberAnimStyles() {
    if (document.getElementById('saber-anim-injected-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'saber-anim-injected-styles';
    style.textContent = `
        /* In-App Modal Stilleri */
        .saber-anim-modal-backdrop {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.65);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 100005;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .saber-anim-modal-backdrop.show {
            opacity: 1;
            pointer-events: auto;
        }
        .saber-anim-modal-card {
            background: var(--bg-panel, #1e293b);
            border: 1px solid rgba(245, 158, 11, 0.45);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 24px rgba(245, 158, 11, 0.25);
            border-radius: 16px;
            width: 90%;
            max-width: 440px;
            padding: 22px 24px;
            color: var(--text-color, #f8fafc);
            transform: scale(0.94) translateY(8px);
            transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            box-sizing: border-box;
        }
        .saber-anim-modal-backdrop.show .saber-anim-modal-card {
            transform: scale(1) translateY(0);
        }
        .saber-anim-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 14px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .saber-anim-modal-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            font-weight: 700;
            color: #f59e0b;
        }
        .saber-anim-modal-icon {
            font-size: 18px;
            filter: drop-shadow(0 0 6px #f59e0b);
        }
        .saber-anim-modal-close {
            background: transparent;
            border: none;
            color: #94a3b8;
            font-size: 22px;
            line-height: 1;
            cursor: pointer;
            padding: 0 4px;
            border-radius: 6px;
            transition: color 0.15s, background-color 0.15s;
        }
        .saber-anim-modal-close:hover {
            color: #f8fafc;
            background: rgba(255, 255, 255, 0.1);
        }
        .saber-anim-modal-body {
            font-size: 13.5px;
            line-height: 1.55;
            color: var(--text-muted, #cbd5e1);
        }
        .saber-anim-modal-warning {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            background: rgba(245, 158, 11, 0.12);
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 10px;
            padding: 10px 12px;
            margin: 14px 0;
            font-size: 12.5px;
            color: #fde68a;
            line-height: 1.45;
        }
        .saber-anim-modal-remember {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12.5px;
            color: #94a3b8;
            cursor: pointer;
            user-select: none;
            margin-top: 10px;
        }
        .saber-anim-modal-remember input {
            accent-color: #f59e0b;
            cursor: pointer;
        }
        .saber-anim-modal-footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
            padding-top: 14px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .saber-anim-btn-cancel {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.18);
            color: #cbd5e1;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s;
        }
        .saber-anim-btn-cancel:hover {
            background: rgba(255, 255, 255, 0.15);
            color: #ffffff;
        }
        .saber-anim-btn-confirm {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            border: none;
            color: #ffffff;
            padding: 8px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
            transition: all 0.15s;
        }
        .saber-anim-btn-confirm:hover {
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            box-shadow: 0 4px 20px rgba(245, 158, 11, 0.6);
            transform: translateY(-1px);
        }
    `;
    document.head.appendChild(style);
}

// ══════════════════════════════════════════════
// 6. BAŞLATMA
// ══════════════════════════════════════════════
function initSaberAnimToggles() {
    injectSaberAnimStyles();

    const tryCreate = () => {
        // Yazı sekmesi
        createAnimToggle('elTextSaberAnim', 'elTextSaber');
        
        // Ana Neon Efektleri sekmesi:
        // Üstteki animasyon butonu (saberModeAnim) kullanıcı isteğiyle kaldırıldı
        const oldTopAnim = document.getElementById('saberModeAnim');
        if (oldTopAnim) {
            const wrap = oldTopAnim.closest('.saber-anim-toggle');
            if (wrap) wrap.remove();
        }
        
        // Alttaki animasyon butonu: Kullanıcının özellikle istediği alt animasyon butonu (saberEnergyNodesAnim) korundu ve aktif edildi
        if (document.getElementById('saberEnergyNodes')) {
            createAnimToggle('saberEnergyNodesAnim', 'saberEnergyNodes', 'saberModeToggle');
        }

        // Çizim Objesi Özellikleri - anim toggle kaldırıldı 
        
        // Dinamik diğer checkbox'lar
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        for (const cb of allCheckboxes) {
            if (cb.id && 
                cb.id !== 'elTextSaber' && 
                cb.id !== 'saberModeToggle' && 
                cb.id !== 'deSaberToggle' && 
                cb.id !== 'saberEnergyNodes' &&
                cb.id !== 'deSaberEnergyNodes' &&
                cb.id !== 'drawSnapToggle' &&
                cb.id !== 'photoLockToggle' &&
                cb.id !== 'saberAnimRememberChoice' &&
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
    
    tryCreate();
    setInterval(tryCreate, 2000);
    
    setTimeout(() => {
        applySaberAnimation('deSaberAnim', false);
    }, 1200);
}

// Global dışa aktarım
window.applySaberAnimation = applySaberAnimation;
window.showSaberAnimModal = showSaberAnimModal;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initSaberAnimToggles, 800);
});

console.log('⚡ Neon & Saber Canlı Animasyon Motoru ve Özel Modal Sistemi yüklendi');

