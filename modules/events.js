
// ==================== 🌟 HIZLI DÜZENLE & 3D DİYALOĞU (ÇİFT TIKLAMA) ====================
window.openQuickEdit3DModal = function(targetElement, clientX, clientY) {
    if (!targetElement) return;

    // Varsa önceki modalı kapat
    const existing = document.getElementById('quick-edit-3d-modal');
    if (existing) existing.remove();

    const root = targetElement.closest('.callout-wrap, .callout-item, .co-neon-block, .added-icon, .canvas-el') || targetElement;
    const classList = (root.className || '').toLowerCase();
    const isIcon = classList.includes('added-icon') || classList.includes('is-svg-icon') || classList.includes('svg-icon') || (!classList.includes('callout-wrap') && !classList.includes('callout-item') && !classList.includes('co-neon-block') && root.querySelector('svg'));
    const isCallout = classList.includes('callout-wrap') || classList.includes('callout-item') || classList.includes('co-neon-block');

    let label = isIcon ? 'İkon' : (isCallout ? 'Rozet' : 'Öğe');

    // Metin ve alt metin çıkarımı
    let mainText = root.dataset.coLabel || '';
    if (!mainText) {
        const textNodes = root.querySelectorAll('text, span, .co-text, p, h1, h2, h3, h4');
        const texts = [];
        textNodes.forEach(t => {
            const s = t.textContent.trim();
            if (s) texts.push(s);
        });
        mainText = texts.join('\n');
    }
    if (!mainText && !isIcon) {
        mainText = root.textContent.trim();
    }

    const parts = (mainText || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const primaryStr = parts[0] || '';
    const subStr = parts.slice(1).join(' ') || '';

    const modal = document.createElement('div');
    modal.id = 'quick-edit-3d-modal';
    modal.className = 'quick-edit-3d-card';

    modal.innerHTML = `
        <div class="q3d-header">
            <span class="q3d-title">
                <i class="fas ${isIcon ? 'fa-icons' : 'fa-certificate'}" style="color:#38bdf8;"></i>
                ${label} Düzenle & 3D
            </span>
            <button type="button" class="q3d-close-btn" id="q3dCloseBtn" title="Kapat">✕</button>
        </div>
        <div class="q3d-body">
            ${!isIcon || primaryStr ? `
            <div class="q3d-input-group">
                <label class="q3d-lbl">📝 Rozet / Metin Yazısı:</label>
                <input type="text" class="q3d-text-input" id="q3dTextInput" value="${primaryStr.replace(/"/g, '&quot;')}" placeholder="Metin yazın...">
            </div>
            ` : ''}
            ${subStr ? `
            <div class="q3d-input-group">
                <label class="q3d-lbl">🏷️ Alt Başlık (Slogan):</label>
                <input type="text" class="q3d-text-input" id="q3dSubTextInput" value="${subStr.replace(/"/g, '&quot;')}" placeholder="Alt başlık...">
            </div>
            ` : ''}

            <!-- ✨ 3D'YE DÖNÜŞTÜR BUTONU -->
            <button type="button" class="q3d-convert-btn" id="q3dConvertBtn">
                <span class="q3d-btn-icon"><i class="fas fa-cube"></i></span>
                <div class="q3d-btn-texts">
                    <span class="q3d-btn-main">✨ 3D'ye Dönüştür</span>
                    <span class="q3d-btn-sub">Fiziksel kalınlık & 6 yön hareketini aç</span>
                </div>
            </button>

            <!-- ☀️ 3D GÜNEŞ & IŞIK BUTONU -->
            <button type="button" class="q3d-sun-btn" id="q3dSunBtn">
                <i class="fas fa-sun"></i> Güneş & Işık Ekle
            </button>

            <!-- Alt Eylemler -->
            <div class="q3d-actions-row">
                <button type="button" class="q3d-act-btn" id="q3dDupBtn"><i class="fas fa-copy"></i> Kopyala</button>
                <button type="button" class="q3d-act-btn" id="q3dFrontBtn"><i class="fas fa-layer-group"></i> Öne Al</button>
                <button type="button" class="q3d-act-btn q3d-act-del" id="q3dDelBtn"><i class="fas fa-trash"></i> Sil</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Konumlandırma
    const rect = root.getBoundingClientRect();
    const modalW = 260;
    const modalH = modal.offsetHeight || 220;

    let posX = (typeof clientX === 'number' && clientX > 0) ? clientX : rect.right + 10;
    let posY = (typeof clientY === 'number' && clientY > 0) ? clientY - 40 : rect.top;

    if (posX + modalW > window.innerWidth - 10) posX = Math.max(10, rect.left - modalW - 10);
    if (posX < 10) posX = 10;
    if (posY + modalH > window.innerHeight - 10) posY = window.innerHeight - modalH - 10;
    if (posY < 10) posY = 10;

    modal.style.left = posX + 'px';
    modal.style.top = posY + 'px';

    const closeModal = () => {
        modal.remove();
        document.removeEventListener('pointerdown', onDocClick, true);
        document.removeEventListener('keydown', onKeyDown, true);
    };

    const onDocClick = (e) => {
        if (e.target && (e.target.closest('#quick-edit-3d-modal') || modal.contains(e.target))) return;
        closeModal();
    };

    const onKeyDown = (e) => {
        if (e.key === 'Escape') closeModal();
    };

    setTimeout(() => {
        document.addEventListener('pointerdown', onDocClick, true);
        document.addEventListener('keydown', onKeyDown, true);
    }, 50);

    const closeBtn = modal.querySelector('#q3dCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Canlı Metin Güncellemesi
    const textInp = modal.querySelector('#q3dTextInput');
    const subInp = modal.querySelector('#q3dSubTextInput');

    function applyTextChange() {
        const pVal = textInp ? textInp.value : '';
        const sVal = subInp ? subInp.value : '';
        const full = sVal ? (pVal + '\n' + sVal) : pVal;
        root.dataset.coLabel = full;

        const firstText = root.querySelector('text, span, .co-text, p');
        if (firstText) firstText.textContent = pVal;

        const coLabelField = document.getElementById('coLabelText');
        if (coLabelField) coLabelField.value = full;
    }

    if (textInp) textInp.addEventListener('input', applyTextChange);
    if (subInp) subInp.addEventListener('input', applyTextChange);

    // ✨ 3D'ye Dönüştür
    const convertBtn = modal.querySelector('#q3dConvertBtn');
    if (convertBtn) {
        convertBtn.addEventListener('click', () => {
            applyTextChange();
            closeModal();
            if (window.ThreeDEngine && typeof window.ThreeDEngine.convert2DBadgeTo3D === 'function') {
                window.ThreeDEngine.convert2DBadgeTo3D(root);
            }
        });
    }

    // ☀️ 3D Güneş & Işık
    const sunBtn = modal.querySelector('#q3dSunBtn');
    if (sunBtn) {
        sunBtn.addEventListener('click', () => {
            closeModal();
            if (window.ThreeDEngine) {
                if (!window.ThreeDEngine.isActive()) window.ThreeDEngine.openStudio();
                if (typeof window.ThreeDEngine.setGizmoTarget === 'function') {
                    window.ThreeDEngine.setGizmoTarget('sun');
                }
                window.ThreeDEngine.state.sunGizmoVisible = true;
                window.ThreeDEngine.state.activeTarget = 'sun';
                if (window.ThreeDEngine.renderDock3DControls) window.ThreeDEngine.renderDock3DControls();
                if (typeof window.showToast === 'function') {
                    window.showToast('☀️ 3D Güneş Aktif — Pencere/Tavan ışığını tuvalde ayarlayın', 'info');
                }
            }
        });
    }

    // Diğer Eylemler
    const dupBtn = modal.querySelector('#q3dDupBtn');
    if (dupBtn) {
        dupBtn.addEventListener('click', () => {
            closeModal();
            if (typeof duplicateSelected === 'function') duplicateSelected();
        });
    }

    const frontBtn = modal.querySelector('#q3dFrontBtn');
    if (frontBtn) {
        frontBtn.addEventListener('click', () => {
            closeModal();
            const parent = root.parentElement;
            if (parent) parent.appendChild(root);
        });
    }

    const delBtn = modal.querySelector('#q3dDelBtn');
    if (delBtn) {
        delBtn.addEventListener('click', () => {
            closeModal();
            if (typeof deleteSelectedCallout === 'function') deleteSelectedCallout();
            else root.remove();
        });
    }
};

// ==================== EVENTS CORE ====================
// Global Event Delegates

// Yardımcı Fonksiyon: Zarif, Kompakt & Yüzer Obje Sağ Tık Menüsü
function openObjectContextMenu(targetElement, isText, clientX, clientY) {
    if (!targetElement) return;

    // 🎯 Her zaman tuvaldeki en üst seviye taşınabilir ana kapsayıcıyı hedef al
    const rootElement = targetElement.closest('.callout-wrap, .draggable, .canvas-el, .added-icon, [data-layer-uid]') || targetElement;
    targetElement = rootElement;

    // Varsa önceki açık menüyü kapat
    const existing = document.getElementById('app-custom-context-menu');
    if (existing) existing.remove();

    const isLocked = targetElement.dataset.locked === 'true' || targetElement.classList.contains('locked-el');
    const isCallout = targetElement.classList.contains('callout-wrap') || targetElement.classList.contains('co-neon-block') || targetElement.classList.contains('callout-item');
    
    // Label belirle
    let label = targetElement.dataset.label || 'Öğe';
    if (targetElement.classList.contains('added-icon')) label = 'İkon';
    else if (isCallout) label = 'Callout';
    else if (targetElement.classList.contains('canvas-el')) label = 'Metin';
    else if (targetElement.classList.contains('editable-draw')) label = 'Çizim';

    const menu = document.createElement('div');
    menu.id = 'app-custom-context-menu';
    menu.className = 'app-context-menu';

    // Sürüklenebilir Header
    let html = `
        <div class="app-context-header" id="acm-drag-header" title="Sürüklemek için basılı tutun">
            <span style="display:flex; align-items:center; gap:5px; pointer-events:none;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style="opacity:0.6;"><circle cx="9" cy="6" r="2"></circle><circle cx="15" cy="6" r="2"></circle><circle cx="9" cy="12" r="2"></circle><circle cx="15" cy="12" r="2"></circle><circle cx="9" cy="18" r="2"></circle><circle cx="15" cy="18" r="2"></circle></svg>
                ${label} İşlemleri
            </span>
            <button class="acm-close-btn" id="acm-close-btn" title="Kapat">✕</button>
        </div>
    `;

    // 🌟 3D MOTORU İŞLEMLERİ (SAĞ TIK MENÜSÜ EN BAŞINDA)
    html += `
        <button class="app-context-item item-3d" id="acm-convert-3d">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            <span>3D'ye Dönüştür (Kalınlık & 6 Yön)</span>
        </button>
        <button class="app-context-item item-sun" id="acm-add-sun">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            <span>3D Güneş & Işık Ekle</span>
        </button>
        <div class="acm-divider"></div>
    `;

    // Metni Düzenle (Eğer metin düzenlenebilir ise)
    if (isText || targetElement.classList.contains('canvas-el') || targetElement.querySelector('.callout-text, .co-neon-text')) {
        html += `
            <button class="app-context-item item-edit" id="acm-edit">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <span>Metni Düzenle</span>
            </button>
        `;
    }

    // Kilitle / Kilidi Aç
    if (isLocked) {
        html += `
            <button class="app-context-item item-lock" id="acm-lock">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>Kilidi Aç</span>
            </button>
        `;
    } else {
        html += `
            <button class="app-context-item item-lock" id="acm-lock">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                <span>Kilitle</span>
            </button>
        `;
    }

    // Sayfaya 9 Yön Konumlandırma & Ortala
    html += `
        <div class="acm-section-label">🎯 SAYFADA KONUMLANDIR</div>
        <div class="acm-grid-btns">
            <button class="acm-grid-btn" id="acm-single-top-left" title="Sol Üst"><span>↖ Sol Üst</span></button>
            <button class="acm-grid-btn" id="acm-single-top-center" title="Üst Orta"><span>⬆ Üst Orta</span></button>
            <button class="acm-grid-btn" id="acm-single-top-right" title="Sağ Üst"><span>↗ Sağ Üst</span></button>
            <button class="acm-grid-btn" id="acm-single-middle-left" title="Orta Sol"><span>⬅ Orta Sol</span></button>
            <button class="acm-grid-btn" id="acm-single-center" title="Sayfa Merkezi" style="background:rgba(56,189,248,0.2); border-color:#38bdf8; color:#fff; font-weight:bold;"><span>🎯 Merkez</span></button>
            <button class="acm-grid-btn" id="acm-single-middle-right" title="Orta Sağ"><span>➡ Orta Sağ</span></button>
            <button class="acm-grid-btn" id="acm-single-bottom-left" title="Sol Alt"><span>↙ Sol Alt</span></button>
            <button class="acm-grid-btn" id="acm-single-bottom-center" title="Alt Orta"><span>⬇ Alt Orta</span></button>
            <button class="acm-grid-btn" id="acm-single-bottom-right" title="Sağ Alt"><span>↘ Sağ Alt</span></button>
        </div>
    `;

    // Döndürme, Boyutlandırma, Sıralama, Çoğalt
    html += `
        <button class="app-context-item" id="acm-single-rot-cw">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Döndür (90° Sağa)</span>
        </button>
        <button class="app-context-item" id="acm-single-scale-up">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            <span>Büyüt (+15%)</span>
        </button>
        <button class="app-context-item" id="acm-single-scale-down">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            <span>Küçült (-15%)</span>
        </button>
        <button class="app-context-item item-front" id="acm-front">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" stroke-width="2.2"><polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline></svg>
            <span>En Öne Getir</span>
        </button>
        <button class="app-context-item item-back" id="acm-back">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.2"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline></svg>
            <span>En Arkaya Gönder</span>
        </button>
        <button class="app-context-item" id="acm-single-duplicate">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>Çoğalt</span>
        </button>
    `;

    // Sil
    html += `
        <div class="acm-divider"></div>
        <button class="app-context-item item-delete" id="acm-delete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>Sil</span>
        </button>
    `;

    menu.innerHTML = html;
    document.body.appendChild(menu);

    // Akıllı Yüzer Konumlandırma
    const rect = targetElement.getBoundingClientRect();
    const menuWidth = 190;
    const menuHeight = menu.offsetHeight || 320;

    let posX, posY;

    if (rect.right + menuWidth + 15 <= window.innerWidth) {
        posX = rect.right + 12;
        posY = Math.max(10, rect.top);
    } else if (rect.left - menuWidth - 15 >= 0) {
        posX = rect.left - menuWidth - 12;
        posY = Math.max(10, rect.top);
    } else {
        posX = (typeof clientX === 'number' && clientX > 0) ? clientX + 15 : rect.left + 20;
        posY = (typeof clientY === 'number' && clientY > 0) ? clientY + 15 : rect.top + 20;
    }

    if (posX + menuWidth > window.innerWidth - 10) posX = window.innerWidth - menuWidth - 10;
    if (posY + menuHeight > window.innerHeight - 10) posY = window.innerHeight - menuHeight - 10;
    if (posX < 10) posX = 10;
    if (posY < 10) posY = 10;

    menu.style.left = posX + 'px';
    menu.style.top = posY + 'px';

    const closeMenu = () => {
        if (menu.parentElement) menu.remove();
        document.removeEventListener('pointerdown', onDocClick, true);
        document.removeEventListener('keydown', onKeyDown, true);
    };

    let didDrag = false;
    const onDocClick = (e) => {
        if (didDrag) return;
        if (e.target && (e.target.closest('#app-custom-context-menu') || menu.contains(e.target))) return;
        closeMenu();
    };
    const onKeyDown = (e) => {
        if (e.key === 'Escape') closeMenu();
    };

    setTimeout(() => {
        document.addEventListener('pointerdown', onDocClick, true);
        document.addEventListener('keydown', onKeyDown, true);
    }, 50);

    // Yüzer Panel Sürükleme
    const header = menu.querySelector('#acm-drag-header');
    if (header) {
        let isDragging = false;
        let dragStartX = 0, dragStartY = 0, startLeft = 0, startTop = 0;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('#acm-close-btn')) return;
            isDragging = true;
            didDrag = false;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            startLeft = menu.offsetLeft;
            startTop = menu.offsetTop;
            header.style.cursor = 'grabbing';
            e.preventDefault();
            e.stopPropagation();
        });

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true;
            let nx = startLeft + dx;
            let ny = startTop + dy;
            nx = Math.max(5, Math.min(window.innerWidth - menu.offsetWidth - 5, nx));
            ny = Math.max(5, Math.min(window.innerHeight - menu.offsetHeight - 5, ny));
            menu.style.left = nx + 'px';
            menu.style.top = ny + 'px';
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                header.style.cursor = 'grab';
                setTimeout(() => { didDrag = false; }, 100);
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    const closeBtn = menu.querySelector('#acm-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
        });
    }

    const bindBtn = (id, fn) => {
        const btn = menu.querySelector(id);
        if (btn) {
            const trigger = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                closeMenu();
                setTimeout(() => {
                    try {
                        fn();
                    } catch (err) {
                        console.error('Single context menu action error for ' + id + ':', err);
                    }
                }, 10);
            };
            btn.addEventListener('click', trigger);
        }
    };

    // 🌟 3D & GÜNEŞ İŞLEMLERİ
    bindBtn('#acm-convert-3d', () => {
        if (window.ThreeDEngine && typeof window.ThreeDEngine.convert2DBadgeTo3D === 'function') {
            const elToConvert = targetElement || window.selectedCalloutEl || window.selectedEl;
            window.ThreeDEngine.convert2DBadgeTo3D(elToConvert);
        }
    });

    bindBtn('#acm-add-sun', () => {
        if (window.ThreeDEngine) {
            if (!window.ThreeDEngine.isActive()) {
                window.ThreeDEngine.openStudio();
            }
            if (typeof window.ThreeDEngine.setGizmoTarget === 'function') {
                window.ThreeDEngine.setGizmoTarget('sun');
            }
            window.ThreeDEngine.state.sunGizmoVisible = true;
            window.ThreeDEngine.state.activeTarget = 'sun';
            if (window.ThreeDEngine.renderDock3DControls) {
                window.ThreeDEngine.renderDock3DControls();
            }
            if (typeof window.showToast === 'function') {
                window.showToast('☀️ 3D Güneş & Işık Aktif — Tuvalde sürükleyerek oda ışığını ayarlayın', 'info');
            }
        }
    });

    // Event Handlers
    bindBtn('#acm-delete', () => {
        targetElement.remove();
        if (typeof drawPaths !== 'undefined') {
            const idx = drawPaths.findIndex(p => p.el === targetElement);
            if (idx > -1) drawPaths.splice(idx, 1);
        }
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof deselectAll === 'function') deselectAll();
        if (typeof renderLayers === 'function') renderLayers();
    });

    bindBtn('#acm-lock', () => {
        const isLocked = targetElement.dataset.locked === 'true' || targetElement.classList.contains('locked-el');
        targetElement.dataset.locked = isLocked ? 'false' : 'true';
        if (isLocked) {
            targetElement.classList.remove('locked-el');
        } else {
            targetElement.classList.add('locked-el');
        }
        if (!targetElement.dataset.layerUid) {
            targetElement.dataset.layerUid = 'layer_' + Math.random().toString(36).substr(2, 9);
        }
        if (typeof window.layerToggleLock === 'function') {
            window.layerToggleLock(targetElement.dataset.layerUid);
        }
        if (typeof renderLayers === 'function') renderLayers();
    });

    bindBtn('#acm-front', () => {
        const parent = targetElement.parentElement;
        if (parent) parent.appendChild(targetElement);
        if (targetElement.classList.contains('editable-draw') && typeof drawPaths !== 'undefined') {
            const idx = drawPaths.findIndex(p => p.el === targetElement);
            if (idx > -1) {
                const p = drawPaths.splice(idx, 1)[0];
                drawPaths.push(p);
            }
        }
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof renderLayers === 'function') renderLayers();
    });

    bindBtn('#acm-back', () => {
        const parent = targetElement.parentElement;
        if (parent && parent.firstChild) parent.insertBefore(targetElement, parent.firstChild);
        if (targetElement.classList.contains('editable-draw') && typeof drawPaths !== 'undefined') {
            const idx = drawPaths.findIndex(p => p.el === targetElement);
            if (idx > -1) {
                const p = drawPaths.splice(idx, 1)[0];
                drawPaths.unshift(p);
            }
        }
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof renderLayers === 'function') renderLayers();
    });

    bindBtn('#acm-single-rot-cw', () => {
        window.selectedElements = [targetElement];
        if (window.multiSelectRotate) window.multiSelectRotate(90);
    });

    bindBtn('#acm-single-scale-up', () => {
        window.selectedElements = [targetElement];
        if (window.multiSelectScale) window.multiSelectScale(1.15);
    });

    bindBtn('#acm-single-scale-down', () => {
        window.selectedElements = [targetElement];
        if (window.multiSelectScale) window.multiSelectScale(0.85);
    });

    bindBtn('#acm-edit', () => {
        const textEl = targetElement.querySelector('.callout-text, .co-neon-text, span, div') || targetElement;
        const curVal = textEl.innerText || textEl.textContent || '';
        const newT = prompt('Metni düzenleyin:', curVal);
        if (newT !== null && newT !== undefined) {
            if (textEl !== targetElement) textEl.innerText = newT;
            else targetElement.innerText = newT;
            if (typeof updateDrawHistory === 'function') updateDrawHistory();
        }
    });

    const bindPos = (id, posName) => {
        bindBtn(id, () => {
            window.selectedElements = [targetElement];
            if (window.multiSelectPositionOnPage) window.multiSelectPositionOnPage(posName);
        });
    };

    bindPos('#acm-single-top-left', 'top-left');
    bindPos('#acm-single-top-center', 'top-center');
    bindPos('#acm-single-top-right', 'top-right');
    bindPos('#acm-single-middle-left', 'middle-left');
    bindPos('#acm-single-center', 'center');
    bindPos('#acm-single-middle-right', 'middle-right');
    bindPos('#acm-single-bottom-left', 'bottom-left');
    bindPos('#acm-single-bottom-center', 'bottom-center');
    bindPos('#acm-single-bottom-right', 'bottom-right');

    bindBtn('#acm-single-duplicate', () => {
        window.selectedElements = [targetElement];
        if (window.multiSelectDuplicate) window.multiSelectDuplicate();
    });
}
window.openObjectContextMenu = openObjectContextMenu;

// ==================== ÇOKLU SEÇİM SAĞ TIK & HİZALAMA MENÜSÜ ====================
function openMultiSelectContextMenu(clientX, clientY) {
    if (!window.selectedElements || window.selectedElements.length < 2) return;

    // Varsa önceki açık menüyü kapat
    const existing = document.getElementById('app-custom-context-menu');
    if (existing) existing.remove();

    const count = window.selectedElements.length;
    const menu = document.createElement('div');
    menu.id = 'app-custom-context-menu';
    menu.className = 'app-context-menu';

    let html = `
        <div class="app-context-header" id="acm-drag-header" title="Sürüklemek için basılı tutun">
            <span style="display:flex; align-items:center; gap:5px; pointer-events:none;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2.2"><rect x="2" y="2" width="20" height="20" rx="3" stroke-dasharray="3 3"/><circle cx="8" cy="8" r="2"/><circle cx="16" cy="16" r="2"/></svg>
                Çoklu Seçim (${count} Öğe)
            </span>
            <button class="acm-close-btn" id="acm-close-btn" title="Kapat">✕</button>
        </div>

        <div class="acm-section-label">↕️ BOŞLUKLU SIRALA (ANTİ-OVERLAP)</div>
        
        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(0,0,0,0.3); padding:4px 8px; border-radius:6px; margin-bottom:4px; border:1px solid rgba(255,255,255,0.08);">
            <span style="font-size:11px; color:#cbd5e1; font-weight:600;"><i class="fas fa-arrows-alt-v" style="color:#38bdf8; margin-right:4px;"></i> Boşluk:</span>
            <div style="display:flex; align-items:center; gap:4px;">
                <button type="button" class="tab-btn" style="padding:1px 6px; font-size:11px; font-weight:bold; min-width:20px;" onclick="window.stepMultiSelectGap(-2)">-</button>
                <input type="number" id="acm-gap-val" value="${window.multiSelectGap || 14}" min="0" max="200" step="2" onchange="window.setMultiSelectGap(this.value)" oninput="window.setMultiSelectGap(this.value)" style="width:38px; text-align:center; padding:1px 2px; font-size:11px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:4px; font-weight:bold;">
                <span style="font-size:10px; color:#94a3b8;">px</span>
                <button type="button" class="tab-btn" style="padding:1px 6px; font-size:11px; font-weight:bold; min-width:20px;" onclick="window.stepMultiSelectGap(2)">+</button>
            </div>
        </div>

        <div style="display:flex; gap:3px; margin-bottom:4px;">
            <button class="app-context-item" id="acm-stack-v" style="flex:1; justify-content:center; background:rgba(99,102,241,0.2); border:1px solid rgba(99,102,241,0.4); font-weight:600;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                <span>Alt Alta Diz</span>
            </button>
            <button class="app-context-item" id="acm-stack-h" style="flex:1; justify-content:center; background:rgba(99,102,241,0.2); border:1px solid rgba(99,102,241,0.4); font-weight:600;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2"><line x1="6" y1="3" x2="6" y2="21"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="18" y1="3" x2="18" y2="21"/></svg>
                <span>Yan Yana Diz</span>
            </button>
        </div>

        <div class="acm-section-label">↔️ BİRBİRİNE GÖRE HİZALA</div>
        <div class="acm-grid-btns">
            <button class="acm-grid-btn" id="acm-align-left" title="Sola Hizala">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="2" x2="4" y2="22"/><rect x="8" y="5" width="12" height="4" rx="1"/><rect x="8" y="15" width="8" height="4" rx="1"/></svg>
                <span>Sola</span>
            </button>
            <button class="acm-grid-btn" id="acm-align-center" title="Yatay Ortala">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="22"/><rect x="5" y="5" width="14" height="4" rx="1"/><rect x="7" y="15" width="10" height="4" rx="1"/></svg>
                <span>Ortala</span>
            </button>
            <button class="acm-grid-btn" id="acm-align-right" title="Sağa Hizala">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="20" y1="2" x2="20" y2="22"/><rect x="4" y="5" width="12" height="4" rx="1"/><rect x="8" y="15" width="8" height="4" rx="1"/></svg>
                <span>Sağa</span>
            </button>
            <button class="acm-grid-btn" id="acm-align-top" title="Üste Hizala">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" y1="4" x2="22" y2="4"/><rect x="5" y="8" width="4" height="12" rx="1"/><rect x="15" y="8" width="4" height="8" rx="1"/></svg>
                <span>Üste</span>
            </button>
            <button class="acm-grid-btn" id="acm-align-middle" title="Dikey Ortala">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" y1="12" x2="22" y2="12"/><rect x="5" y="5" width="4" height="14" rx="1"/><rect x="15" y="7" width="4" height="10" rx="1"/></svg>
                <span>Dikey</span>
            </button>
            <button class="acm-grid-btn" id="acm-align-bottom" title="Alta Hizala">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" y1="20" x2="22" y2="20"/><rect x="5" y="4" width="4" height="12" rx="1"/><rect x="15" y="8" width="4" height="8" rx="1"/></svg>
                <span>Alta</span>
            </button>
        </div>

        <div class="acm-section-label">🎯 SAYFADA 9 YÖN KONUMLANDIRMA</div>
        <div class="acm-grid-btns">
            <button class="acm-grid-btn" id="acm-pos-top-left" title="Sol Üst"><span>↖ Sol Üst</span></button>
            <button class="acm-grid-btn" id="acm-pos-top-center" title="Üst Orta"><span>⬆ Üst Orta</span></button>
            <button class="acm-grid-btn" id="acm-pos-top-right" title="Sağ Üst"><span>↗ Sağ Üst</span></button>
            <button class="acm-grid-btn" id="acm-pos-middle-left" title="Orta Sol"><span>⬅ Orta Sol</span></button>
            <button class="acm-grid-btn" id="acm-pos-center" title="Sayfa Merkezi" style="background:rgba(56,189,248,0.2); border-color:#38bdf8; color:#fff; font-weight:bold;"><span>🎯 Merkez</span></button>
            <button class="acm-grid-btn" id="acm-pos-middle-right" title="Orta Sağ"><span>➡ Orta Sağ</span></button>
            <button class="acm-grid-btn" id="acm-pos-bottom-left" title="Sol Alt"><span>↙ Sol Alt</span></button>
            <button class="acm-grid-btn" id="acm-pos-bottom-center" title="Alt Orta"><span>⬇ Alt Orta</span></button>
            <button class="acm-grid-btn" id="acm-pos-bottom-right" title="Sağ Alt"><span>↘ Sağ Alt</span></button>
        </div>

        <div class="acm-section-label">📏 SAYFADA ORTALA & ARALIKLARI EŞİTLE</div>
        <button class="app-context-item" id="acm-page-center-h">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
            <span>Sayfada Yatay Ortala</span>
        </button>
        <button class="app-context-item" id="acm-page-center-v">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
            <span>Sayfada Dikey Ortala</span>
        </button>
        <button class="app-context-item" id="acm-distribute-v">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><line x1="3" y1="4" x2="21" y2="4"/><line x1="3" y1="20" x2="21" y2="20"/><rect x="7" y="9" width="10" height="6" rx="1"/></svg>
            <span>Dikey Aralıkları Eşitle</span>
        </button>
        <button class="app-context-item" id="acm-distribute-h">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><line x1="4" y1="3" x2="4" y2="21"/><line x1="20" y1="3" x2="20" y2="21"/><rect x="9" y="7" width="6" height="10" rx="1"/></svg>
            <span>Yatay Aralıkları Eşitle</span>
        </button>

        <div style="height: 1px; background: rgba(255,255,255,0.06); margin: 3px 0;"></div>

        <div class="acm-section-label">📦 TOPLU İŞLEMLER</div>
        <button class="app-context-item" id="acm-multi-group">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/><path d="M7 11v6h6"/></svg>
            <span>Grup Yap</span>
        </button>
        <button class="app-context-item" id="acm-multi-ungroup">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M10 10l4 4"/></svg>
            <span>Grubu Boz</span>
        </button>
        <button class="app-context-item" id="acm-multi-convert-polygon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon></svg>
            <span>🔷 Çokgene Çevir (Birleştir)</span>
        </button>
        <button class="app-context-item item-front" id="acm-multi-front">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" stroke-width="2"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>
            <span>En Öne Getir</span>
        </button>
        <button class="app-context-item item-back" id="acm-multi-back">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="7 13 12 18 17 13"/><polyline points="7 6 12 11 17 6"/></svg>
            <span>En Arkaya Gönder</span>
        </button>
        <button class="app-context-item" id="acm-multi-rot-cw">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Toplu Döndür (90° Sağa)</span>
        </button>
        <button class="app-context-item" id="acm-multi-scale-up">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            <span>Toplu Büyüt (+15%)</span>
        </button>
        <button class="app-context-item" id="acm-multi-scale-down">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            <span>Toplu Küçült (-15%)</span>
        </button>
        <button class="app-context-item item-lock" id="acm-multi-lock">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span>Kilitle / Kilidi Aç</span>
        </button>
        <button class="app-context-item" id="acm-multi-duplicate">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>Toplu Çoğalt</span>
        </button>
        <button class="app-context-item item-delete" id="acm-multi-delete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <span>Toplu Sil</span>
        </button>
    `;

    menu.innerHTML = html;
    document.body.appendChild(menu);

    const menuWidth = 195;
    const menuHeight = menu.offsetHeight || 420;

    let posX = (typeof clientX === 'number' && clientX > 0) ? clientX : 100;
    let posY = (typeof clientY === 'number' && clientY > 0) ? clientY : 100;

    if (posX + menuWidth > window.innerWidth - 10) posX = window.innerWidth - menuWidth - 10;
    if (posY + menuHeight > window.innerHeight - 10) posY = window.innerHeight - menuHeight - 10;
    if (posX < 10) posX = 10;
    if (posY < 10) posY = 10;

    menu.style.left = posX + 'px';
    menu.style.top = posY + 'px';

    const closeMenu = () => {
        if (menu.parentElement) menu.remove();
        document.removeEventListener('pointerdown', onDocClick, true);
        document.removeEventListener('keydown', onKeyDown, true);
    };

    let didDrag = false;
    const onDocClick = (e) => {
        if (didDrag) return;
        if (e.target && (e.target.closest('#app-custom-context-menu') || menu.contains(e.target))) return;
        closeMenu();
    };
    const onKeyDown = (e) => {
        if (e.key === 'Escape') closeMenu();
    };

    setTimeout(() => {
        document.addEventListener('pointerdown', onDocClick, true);
        document.addEventListener('keydown', onKeyDown, true);
    }, 50);

    // Draggable header
    const header = menu.querySelector('#acm-drag-header');
    if (header) {
        let isDragging = false;
        let dragStartX = 0, dragStartY = 0, startLeft = 0, startTop = 0;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('#acm-close-btn')) return;
            isDragging = true;
            didDrag = false;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            startLeft = menu.offsetLeft;
            startTop = menu.offsetTop;
            header.style.cursor = 'grabbing';
            e.preventDefault();
            e.stopPropagation();
        });

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true;
            let nx = startLeft + dx;
            let ny = startTop + dy;
            nx = Math.max(5, Math.min(window.innerWidth - menu.offsetWidth - 5, nx));
            ny = Math.max(5, Math.min(window.innerHeight - menu.offsetHeight - 5, ny));
            menu.style.left = nx + 'px';
            menu.style.top = ny + 'px';
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                header.style.cursor = 'grab';
                setTimeout(() => { didDrag = false; }, 100);
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    const closeBtn = menu.querySelector('#acm-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
        });
    }

    // Attach actions
    const bindBtn = (id, fn) => {
        const btn = menu.querySelector(id);
        if (btn) {
            const trigger = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                closeMenu();
                setTimeout(() => {
                    try {
                        fn();
                    } catch (err) {
                        console.error('Context menu action error for ' + id + ':', err);
                    }
                }, 10);
            };
            btn.addEventListener('click', trigger);
        }
    };

    bindBtn('#acm-stack-v', () => { if (window.multiSelectStack) window.multiSelectStack('vertical'); });
    bindBtn('#acm-stack-h', () => { if (window.multiSelectStack) window.multiSelectStack('horizontal'); });

    bindBtn('#acm-align-left', () => { if (window.multiSelectAlign) window.multiSelectAlign('left'); });
    bindBtn('#acm-align-center', () => { if (window.multiSelectAlign) window.multiSelectAlign('center'); });
    bindBtn('#acm-align-right', () => { if (window.multiSelectAlign) window.multiSelectAlign('right'); });
    bindBtn('#acm-align-top', () => { if (window.multiSelectAlign) window.multiSelectAlign('top'); });
    bindBtn('#acm-align-middle', () => { if (window.multiSelectAlign) window.multiSelectAlign('middle'); });
    bindBtn('#acm-align-bottom', () => { if (window.multiSelectAlign) window.multiSelectAlign('bottom'); });

    bindBtn('#acm-pos-top-left', () => { if (window.multiSelectPositionOnPage) window.multiSelectPositionOnPage('top-left'); });
    bindBtn('#acm-pos-top-center', () => { if (window.multiSelectPositionOnPage) window.multiSelectPositionOnPage('top-center'); });
    bindBtn('#acm-pos-top-right', () => { if (window.multiSelectPositionOnPage) window.multiSelectPositionOnPage('top-right'); });
    bindBtn('#acm-pos-middle-left', () => { if (window.multiSelectPositionOnPage) window.multiSelectPositionOnPage('middle-left'); });
    bindBtn('#acm-pos-center', () => { if (window.multiSelectPositionOnPage) window.multiSelectPositionOnPage('center'); });
    bindBtn('#acm-pos-middle-right', () => { if (window.multiSelectPositionOnPage) window.multiSelectPositionOnPage('middle-right'); });
    bindBtn('#acm-pos-bottom-left', () => { if (window.multiSelectPositionOnPage) window.multiSelectPositionOnPage('bottom-left'); });
    bindBtn('#acm-pos-bottom-center', () => { if (window.multiSelectPositionOnPage) window.multiSelectPositionOnPage('bottom-center'); });
    bindBtn('#acm-pos-bottom-right', () => { if (window.multiSelectPositionOnPage) window.multiSelectPositionOnPage('bottom-right'); });

    bindBtn('#acm-page-center-h', () => { if (window.multiSelectCenterOnPage) window.multiSelectCenterOnPage('horizontal'); });
    bindBtn('#acm-page-center-v', () => { if (window.multiSelectCenterOnPage) window.multiSelectCenterOnPage('vertical'); });

    bindBtn('#acm-distribute-v', () => { if (window.multiSelectDistribute) window.multiSelectDistribute('vertical'); });
    bindBtn('#acm-distribute-h', () => { if (window.multiSelectDistribute) window.multiSelectDistribute('horizontal'); });

    bindBtn('#acm-multi-group', () => { if (window.groupSelected) window.groupSelected(); });
    bindBtn('#acm-multi-ungroup', () => { if (window.ungroupSelected) window.ungroupSelected(); });
    bindBtn('#acm-multi-convert-polygon', () => { if (window.createPolygonFromSelectedLines) window.createPolygonFromSelectedLines(); });
    bindBtn('#acm-multi-front', () => { if (window.multiSelectBringToFront) window.multiSelectBringToFront(); });
    bindBtn('#acm-multi-back', () => { if (window.multiSelectSendToBack) window.multiSelectSendToBack(); });
    bindBtn('#acm-multi-rot-cw', () => { if (window.multiSelectRotate) window.multiSelectRotate(90); });
    bindBtn('#acm-multi-scale-up', () => { if (window.multiSelectScale) window.multiSelectScale(1.15); });
    bindBtn('#acm-multi-scale-down', () => { if (window.multiSelectScale) window.multiSelectScale(0.85); });
    bindBtn('#acm-multi-lock', () => { if (window.multiSelectToggleLock) window.multiSelectToggleLock(); });
    bindBtn('#acm-multi-duplicate', () => { if (window.multiSelectDuplicate) window.multiSelectDuplicate(); });
    bindBtn('#acm-multi-delete', () => { if (window.multiSelectDelete) window.multiSelectDelete(); });
}

// 🌟 Rozetler veya İkonlar kütüphanesindeki bir öğeye sağ tıklandığında açılan 3D Hızlı Seçenek Menüsü
function openLibraryItem3DContextMenu(libItem, clientX, clientY) {
    if (!libItem) return;

    const prevLibMenu = document.getElementById('app-lib-context-menu');
    if (prevLibMenu) prevLibMenu.remove();
    const prevAcm = document.getElementById('app-custom-context-menu');
    if (prevAcm) prevAcm.remove();

    const isIcon = libItem.classList.contains('pool-icon-item') || 
                   (libItem.closest && libItem.closest('#tab-icons')) || 
                   (libItem.closest && libItem.closest('#otherCalloutsGrid')) ||
                   libItem.classList.contains('other-callout-card');
    const typeLabel = isIcon ? 'İkon' : 'Rozet';

    const menu = document.createElement('div');
    menu.id = 'app-lib-context-menu';
    menu.className = 'app-context-menu';

    menu.innerHTML = `
        <div class="app-context-header">
            <span style="display:flex; align-items:center; gap:5px; pointer-events:none;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style="opacity:0.6;"><circle cx="9" cy="6" r="2"></circle><circle cx="15" cy="6" r="2"></circle><circle cx="9" cy="12" r="2"></circle><circle cx="15" cy="12" r="2"></circle><circle cx="9" cy="18" r="2"></circle><circle cx="15" cy="18" r="2"></circle></svg>
                ${typeLabel} Seçenekleri
            </span>
            <button class="acm-close-btn" id="lib-acm-close" title="Kapat">✕</button>
        </div>
        <button class="app-context-item item-3d" id="lib-convert-3d">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            <span>3D'ye Dönüştür (Tuvalde Aç)</span>
        </button>
        <button class="app-context-item" id="lib-add-2d">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            <span>Normal (2D) Olarak Ekle</span>
        </button>
    `;

    document.body.appendChild(menu);

    let posX = clientX || 200;
    let posY = clientY || 200;
    if (posX + 230 > window.innerWidth) posX = window.innerWidth - 240;
    if (posY + 130 > window.innerHeight) posY = window.innerHeight - 140;

    menu.style.position = 'fixed';
    menu.style.left = Math.max(10, posX) + 'px';
    menu.style.top = Math.max(10, posY) + 'px';
    menu.style.zIndex = '999999';

    const closeLibMenu = () => { if (menu.parentNode) menu.remove(); };
    menu.querySelector('#lib-acm-close').onclick = closeLibMenu;

    menu.querySelector('#lib-convert-3d').onclick = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        closeLibMenu();

        // Kütüphane öğesi meta verilerini topla (Konum Pini, Ok, İkon veya Rozet tipi)
        const itemName = (libItem.textContent || '').trim();
        const headerEl = libItem.closest('.accordion-item')?.querySelector('.accordion-header') || 
                         libItem.closest('[data-cat]') || 
                         libItem.closest('.tab-pane');
        const catTitle = (headerEl ? headerEl.textContent : '').toLowerCase();
        const svgEl = libItem.querySelector('svg');
        let rawSvg = svgEl ? svgEl.outerHTML : '';

        const iconI = libItem.querySelector('i');
        const iconClass = iconI ? iconI.className : '';
        const isNeon = !!(iconClass && (iconClass.includes('fa-') || iconClass.includes('fas')));
        let neonSvg = null;
        if (isNeon && typeof window.getNeonIconSvg === 'function') {
            neonSvg = window.getNeonIconSvg(iconClass, '#93c5fd');
        }

        const isPin = catTitle.includes('konum') || catTitle.includes('pin') || 
                      itemName.toLowerCase().includes('pin') || itemName.toLowerCase().includes('konum') ||
                      (rawSvg && (rawSvg.includes('190') && rawSvg.includes('80')));
        const isArrow = catTitle.includes('ok') || catTitle.includes('arrow') || 
                        itemName.toLowerCase().includes('ok') || itemName.toLowerCase().includes('arrow');

        const lines = itemName.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        const mainText = lines[0] || itemName;
        const subText = lines.slice(1).join(' ') || '';

        const meta = {
            itemName: itemName,
            name: itemName,
            catTitle: catTitle,
            isPin: isPin,
            isArrow: isArrow,
            rawSvg: rawSvg || neonSvg,
            svg: rawSvg || neonSvg,
            elementType: isNeon ? 'badge_card' : undefined,
            selectedIconId: neonSvg || undefined,
            text: isNeon ? mainText : undefined,
            subtext: isNeon ? subText : undefined,
            badgeSubtext: isNeon ? subText : undefined,
            badgeBgColor: isNeon ? '#0d1b2e' : undefined,
            frontColor: isNeon ? '#93c5fd' : undefined,
            sideColor: isNeon ? '#1e3a8a' : undefined
        };

        if (window.ThreeDEngine && typeof window.ThreeDEngine.add3DElementFromData === 'function') {
            window.ThreeDEngine.add3DElementFromData(meta);
            return;
        }

        // Fallback:
        libItem.click();
        setTimeout(() => {
            const added = (typeof window.selectedCalloutEl !== 'undefined' && window.selectedCalloutEl) ||
                          (typeof selectedCalloutEl !== 'undefined' && selectedCalloutEl) ||
                          (typeof window.selectedEl !== 'undefined' && window.selectedEl) ||
                          document.querySelector('#canvas-container .callout-wrap:last-child, #workArea .callout-wrap:last-child, #ui-layer .added-icon:last-child, #canvas-container .draggable:last-child');
            if (added && window.ThreeDEngine && typeof window.ThreeDEngine.convert2DBadgeTo3D === 'function') {
                window.ThreeDEngine.convert2DBadgeTo3D(added, meta);
            }
        }, 40);
    };

    menu.querySelector('#lib-add-2d').onclick = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        closeLibMenu();
        window._tempForce2D = true;
        try {
            libItem.click();
        } finally {
            setTimeout(() => { window._tempForce2D = false; }, 100);
        }
    };

    setTimeout(() => {
        const closeOnOut = (ev) => {
            if (!menu.contains(ev.target)) {
                closeLibMenu();
                document.removeEventListener('pointerdown', closeOnOut);
            }
        };
        document.addEventListener('pointerdown', closeOnOut);
    }, 50);
}

// 1. PC: Mouse Sağ Tık (Context Menu)
document.addEventListener('contextmenu', function(e) {
    // 🌟 Rozetler veya İkonlar kütüphanesindeki bir öğeye sağ tıklandıysa: 3D Seçenek Menüsü Aç!
    const libBadgeOrIcon = e.target.closest && e.target.closest(
        '.callout-svg-btn, #calloutAccordion .accordion-body > div, .other-callout-card, ' +
        '.pool-icon-item, #lucideSearchResults > div, #iconCategoryList .cat-body > div, #iconPool > div, .cvi-grid-item'
    );
    if (libBadgeOrIcon) {
        e.preventDefault();
        e.stopPropagation();
        openLibraryItem3DContextMenu(libBadgeOrIcon, e.clientX, e.clientY);
        return;
    }

    // 🌟 3D Stüdyo açıkken tuvalde sağ tık: 3D Menüsünü Aç ve Tarayıcı Menüsünü Kesinlikle Engelle
    if (window.ThreeDEngine && typeof window.ThreeDEngine.isActive === 'function' && window.ThreeDEngine.isActive()) {
        if (e.target.closest && e.target.closest('#canvas-container, #workArea, #threeDCanvas, .three-d-canvas, #threeDGizmoOverlay, #threeDCornerPinOverlay, .main-canvas')) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof window.ThreeDEngine.openContextMenu === 'function') {
                const hitEl = (typeof window.ThreeDEngine.checkHit === 'function') ? window.ThreeDEngine.checkHit(e.clientX, e.clientY) : null;
                const activeEl = hitEl || (typeof window.ThreeDEngine.getActiveElement === 'function' ? window.ThreeDEngine.getActiveElement() : null);
                if (activeEl) {
                    if (typeof window.ThreeDEngine.selectElement === 'function') {
                        window.ThreeDEngine.selectElement(activeEl.id);
                    }
                    window.ThreeDEngine.openContextMenu(activeEl, e.clientX, e.clientY);
                }
            }
            return;
        }
    }

    // Yan paneller, butonlar ve form inputlarında default menüyü koru
    if (e.target.closest && e.target.closest('input, button, select, textarea, .panel, .mobile-panel')) {
        return;
    }

    // Çoklu seçim varken sağ tıklandıysa
    if (window.selectedElements && window.selectedElements.length > 1) {
        const clickedEl = e.target.closest('.callout-item, .callout-wrap, .co-neon-block, .canvas-icon, .draggable, .added-icon, .cvi-item, .editable-draw, .canvas-el, .cvi-badge-box, [data-layer-uid]');
        const isOneOfSelected = (clickedEl && window.selectedElements.some(sel => sel === clickedEl || sel.contains(clickedEl) || clickedEl.contains(sel))) ||
                                window.selectedElements.some(sel => sel.contains(e.target));
        if (isOneOfSelected || e.target.closest('#canvas-container, .main-canvas, #ui-layer, #draw-canvas, #canva-render-layer, #photo-layer')) {
            e.preventDefault();
            openMultiSelectContextMenu(e.clientX, e.clientY);
            return;
        }
    }

    let callout = e.target.closest('.callout-wrap, .callout-item, .co-neon-block, .canvas-icon, .draggable, .added-icon, .cvi-item, .editable-draw, .canvas-el, .cvi-badge-box, [data-layer-uid]');
    if (!callout && window.selectedEl && (window.selectedEl === e.target || window.selectedEl.contains(e.target))) {
        callout = window.selectedEl;
    }
    if (!callout && window.selectedElements && window.selectedElements.length === 1 && (window.selectedElements[0] === e.target || window.selectedElements[0].contains(e.target))) {
        callout = window.selectedElements[0];
    }

    if (callout) {
        // En üst seviyedeki taşınabilir ana kapsayıcıyı al
        const topEl = callout.closest('.callout-wrap, .draggable, .canvas-el, .added-icon, [data-layer-uid]') || callout;
        callout = topEl;
        e.preventDefault();
        if (typeof selectElement === 'function' && (!window.selectedElements || window.selectedElements.length <= 1)) {
            selectElement(callout);
        }
        const isText = callout.classList.contains('callout-item') && !callout.classList.contains('callout-wrap');
        openObjectContextMenu(callout, isText, e.clientX, e.clientY);
    } else if (e.target.closest('#canvas-container, #workArea, #ui-layer, .main-canvas, #draw-canvas, #canva-render-layer, #photo-layer')) {
        // Tuval zeminine sağ tıklandığında varsayılan tarayıcı context menüsünü engelle
        e.preventDefault();
    }
});

// 2. Mobil: Uzun Basma (Long Press) Sensörü
let longPressTimer;
let touchStartX, touchStartY;
const LONG_PRESS_DURATION = 500;

document.addEventListener('touchstart', function(e) {
    // Tutamaçlara veya butonlara basıldığında uzun basma menüsünü tetikleme
    if (e.target.closest && e.target.closest(
        '.callout-controls, .callout-resizer, .callout-rotator, .text-handle, .text-resize-handle, ' +
        '.text-rotate-handle, .text-delete-handle, .text-lock-handle, .draw-handle, .vertex-handle, .cbtn-del, input, button, select, textarea, .panel, .mobile-panel'
    )) {
        return;
    }
    const callout = e.target.closest('.callout-item, .callout-wrap, .co-neon-block, .canvas-icon, .draggable, .editable-draw');
    if (callout && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        
        longPressTimer = setTimeout(() => {
            // Eğer hala aynı elementteyse
            const isText = callout.classList.contains('callout-item') && !callout.classList.contains('callout-wrap');
            // Haptic feedback (titreşim)
            if (navigator.vibrate) navigator.vibrate(50);
            
            if (typeof window.isMobileDevice === 'function' && window.isMobileDevice()) {
                window.isLongPressOpen = true;
                const isCallout = callout.classList.contains('callout-wrap') || callout.classList.contains('co-neon-block') || callout.classList.contains('callout-item');
                if (isCallout) {
                    const innerEl = callout.classList.contains('callout-wrap') ? callout.querySelector('.callout-svg-container, .callout-item') || callout : callout;
                    if (typeof selectCalloutEl === 'function') selectCalloutEl(innerEl, true);
                } else {
                    if (typeof selectElement === 'function') selectElement(callout, false, true);
                }
                if (typeof switchTab === 'function') switchTab(isCallout ? 'callout' : (callout.classList.contains('editable-draw') ? 'draw' : 'element'));
            } else {
                openObjectContextMenu(callout, isText);
            }
        }, LONG_PRESS_DURATION);
    }
}, { passive: true, capture: true });

document.addEventListener('touchmove', function(e) {
    if (longPressTimer) {
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        // Eğer parmak 10 pikselden fazla kayarsa, uzun basmayı iptal et
        if (dx > 10 || dy > 10) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    }
}, { passive: true, capture: true });

document.addEventListener('touchend', function(e) {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}, { passive: true, capture: true });

// 3. Çift Tıklama (Double Click) ile Hızlı 3D & Düzenleme Modalı
document.addEventListener('dblclick', function(e) {
    const target = e.target.closest('.callout-wrap, .callout-item, .co-neon-block, .added-icon, .svg-icon, .icon-wrapper, .canvas-el');
    if (target) {
        e.stopPropagation();
        e.preventDefault();
        if (typeof window.openQuickEdit3DModal === 'function') {
            window.openQuickEdit3DModal(target, e.clientX, e.clientY);
        }
    }
});

// Boş tuvale veya canvas zeminine tıklandığında seçimi ve tutamaçları temizle
document.addEventListener('pointerdown', function(e) {
    if (e.button !== 0 && e.type === 'pointerdown') return; // Sağ tık veya orta tık seçimi bozmasın
    
    // Çizim modu aktifken tuvale tıklamak ÇİZİM YAPMAK içindir! Asla çizim modunu kapatma veya seçimi bozma!
    if (typeof drawMode !== 'undefined' && drawMode !== 'off' && drawMode !== null) {
        return;
    }

    if (e.target.closest(
        '.draggable, .canvas-el, .callout-wrap, .callout-item, .co-neon-block, .editable-draw, ' +
        '.text-handle, .text-resize-handle, .text-rotate-handle, .text-delete-handle, .text-lock-handle, ' +
        '.callout-controls, .callout-resizer, .callout-rotator, .callout-lock-btn, .callout-select-border, ' +
        '.draw-handle, .vertex-handle, .cbtn-del, .sidebar, .right-sidebar, .panel, .mobile-panel, ' +
        '.tab-content, .dynamic-field, .tab-btn, button, input, select, textarea, .swal2-container, .modal, .context-menu, .app-context-menu, ' +
        '#threeDStudioPanel, .three-d-panel, #threeDGizmoOverlay, #threeDCornerPinOverlay, #threeDCanvasBadge, #threeDDockControls, .dock-3d-controls'
    )) {
        return;
    }
    // Boşa tıklandığında seçimi ve tutamaçları temizle ("boşa tıklayınca gitmeli")
    if (typeof deselectAll === 'function') deselectAll();
    if (typeof closeCalloutPanel === 'function') closeCalloutPanel();
});

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof window.initUndoSystem === 'function') window.initUndoSystem();
    }, 1000);
});


// ==========================================
// DRAGGABLE BOTTOM SHEET LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const panels = document.querySelectorAll('.dynamic-field');
    
    panels.forEach(panel => {
        // Create drag handle
        const handle = document.createElement('div');
        handle.className = 'drag-handle';
        const bar = document.createElement('div');
        bar.className = 'drag-bar';
        handle.appendChild(bar);
        
        // Create scroll container wrapper for panel content ONLY ON MOBILE to prevent PC layout breaks
        let updatePanelScale = () => {}; // No-op for PC
        
        if (window.isMobileDevice && window.isMobileDevice()) {
            const scrollContainer = document.createElement('div');
            scrollContainer.className = 'panel-scroll-container';
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'panel-content-wrapper';
            
            updatePanelScale = () => {
                const baseWidth = 320;
                const currentWidth = panel.offsetWidth;
                if(currentWidth > 50) {
                    const scale = Math.max(0.65, Math.min(1.4, currentWidth / baseWidth));
                    if (scrollContainer.style.zoom != scale) {
                        const scrollRatio = scrollContainer.scrollHeight > scrollContainer.clientHeight 
                            ? scrollContainer.scrollTop / (scrollContainer.scrollHeight - scrollContainer.clientHeight) 
                            : 0;
                        
                        contentWrapper.style.zoom = scale;
                        
                        if (scrollContainer.scrollHeight > scrollContainer.clientHeight) {
                            scrollContainer.scrollTop = scrollRatio * (scrollContainer.scrollHeight - scrollContainer.clientHeight);
                        }
                    }
                }
            };
            setTimeout(updatePanelScale, 100);

            // Move everything EXCEPT the handle into the wrapper
            Array.from(panel.childNodes).forEach(child => {
                if (child.className !== 'drag-handle') {
                    contentWrapper.appendChild(child);
                }
            });
            scrollContainer.appendChild(contentWrapper);
            panel.appendChild(scrollContainer);
        }
        
        const closeBtn = document.createElement('div');
        closeBtn.className = 'floating-close-btn';
        closeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            if(document.getElementById('toggleFloatingPanel')) {
                document.getElementById('toggleFloatingPanel').checked = false;
            }
            if(typeof toggleFloatingPanelMode === 'function') {
                toggleFloatingPanelMode(false);
            }
            document.querySelectorAll('.dynamic-field').forEach(f => f.classList.remove('show'));
            document.querySelectorAll('#mainTabs .tab-btn').forEach(b => b.classList.remove('active'));
        };
        panel.appendChild(closeBtn);
        
        const expandBtn = document.createElement('div');
        expandBtn.className = 'floating-expand-btn';
        expandBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>';
        let isResizing = false;
        let startResizeWidth = 0;
        let startResizeHeight = 0;
        let startResizeX = 0;
        let startResizeY = 0;

        const startResize = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if(!document.body.classList.contains('floating-panels-active')) return;
            isResizing = true;
            panel.classList.add('dragging');
            startResizeWidth = panel.offsetWidth;
            startResizeHeight = panel.offsetHeight;
            const touch = e.touches ? e.touches[0] : e;
            startResizeX = touch.clientX;
            startResizeY = touch.clientY;
        };

        const doResize = (e) => {
            if (!isResizing) return;
            e.preventDefault();
            e.stopPropagation();
            const touch = e.touches ? e.touches[0] : e;
            const dx = touch.clientX - startResizeX;
            const dy = touch.clientY - startResizeY;
            
            let newWidth = startResizeWidth + dx;
            let newHeight = startResizeHeight + dy;
            
            // Constrain
            if (newWidth < 200) newWidth = 200;
            if (newHeight < 200) newHeight = 200;
            
            panel.style.setProperty('width', newWidth + 'px', 'important');
                  updatePanelScale();
            panel.style.setProperty('height', newHeight + 'px', 'important');
            updatePanelScale();
        };

        const stopResize = (e) => {
            if (!isResizing) return;
            isResizing = false;
            panel.classList.remove('dragging');
        };

        expandBtn.addEventListener('mousedown', startResize, {passive: false});
        expandBtn.addEventListener('touchstart', startResize, {passive: false});
        expandBtn.addEventListener('pointerdown', startResize, {passive: false});
        
        document.addEventListener('mousemove', doResize, {passive: false});
        document.addEventListener('touchmove', doResize, {passive: false});
        document.addEventListener('pointermove', doResize, {passive: false});
        
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchend', stopResize);
        document.addEventListener('pointerup', stopResize);
        document.addEventListener('pointercancel', stopResize);
        
        panel.appendChild(expandBtn);
        
        panel.appendChild(handle);

        let startY = 0, startX = 0;
        let startHeight = 0, startWidth = 0;
        let isDragging = false;
        let isLandscape = false;

        let startPanelX = 0, startPanelY = 0;

        panel.addEventListener('touchstart', (e) => {
            if((!window.isMobileDevice())) return; // Only on mobile
            
            const isFloating = document.body.classList.contains('floating-panels-active');
            const tgt = e.target;
            if (tgt.closest('button, input, select, textarea, .floating-close-btn, .range-slider, .color-picker, .preset-btn, .accordion-content, a')) return;
            
            if (!isFloating) {
                if (!tgt.closest('.drag-handle') ) return;
            }
            
            if (isFloating) {
                if (tgt.closest('.panel-scroll-container') && !tgt.closest('.section-title')) {
                    return;
                }
            }
            
            isDragging = true;
            isLandscape = window.innerWidth > window.innerHeight;
            
            if (isFloating) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                const rect = panel.getBoundingClientRect();
                startPanelX = rect.left;
                startPanelY = rect.top;
            } else {
                if (isLandscape) {
                    startX = e.touches[0].clientX;
                    startWidth = panel.getBoundingClientRect().width;
                } else {
                    startY = e.touches[0].clientY;
                    startHeight = panel.getBoundingClientRect().height;
                }
            }
            panel.classList.add('dragging');
        }, {passive: true});

        panel.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            if (document.body.classList.contains('floating-panels-active')) {
                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                const newX = startPanelX + (currentX - startX);
                const newY = startPanelY + (currentY - startY);
                panel.style.setProperty('left', newX + 'px', 'important');
                panel.style.setProperty('top', newY + 'px', 'important');
                panel.style.setProperty('bottom', 'auto', 'important');
                panel.style.setProperty('right', 'auto', 'important');
                return;
            }
            
            if (isLandscape) {
                const deltaX = e.touches[0].clientX - startX;
                let newWidth = startWidth - deltaX;
                const minWidth = 150;
                const maxWidth = window.innerWidth * 0.8;
                if (newWidth > maxWidth) newWidth = maxWidth;
                if (newWidth < minWidth) newWidth = minWidth;
                panel.style.setProperty('width', newWidth + 'px', 'important');
                  updatePanelScale();
            } else {
                const currentY = e.touches[0].clientY;
                const deltaY = currentY - startY;
                let newHeight = startHeight - deltaY;
                const minHeight = window.innerHeight * 0.2;
                const maxHeight = window.innerHeight * 0.85;
                if (newHeight < minHeight) newHeight = minHeight;
                if (newHeight > maxHeight) newHeight = maxHeight;
                panel.style.setProperty('height', newHeight + 'px', 'important');
            updatePanelScale();
            }
        }, {passive: false});

        panel.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            panel.classList.remove('dragging');
            // Auto-close logic removed per user request.
        });

        
        handle.addEventListener('touchcancel', () => {
            isDragging = false;
            panel.classList.remove('dragging');
        });
    });
});


// Expose closeBottomSheet to global scope
// Moved closeBottomSheet to module
;

// ==========================================
// ORIENTATION CHANGE LISTENER FOR PANELS
// ==========================================
let lastOrientationWasLandscape = window.innerWidth > window.innerHeight;
window.addEventListener('resize', () => {
    if (typeof window.isMobileDevice === 'function' && !window.isMobileDevice()) return;
    const isLandscape = window.innerWidth > window.innerHeight;
    
    // Yön değişimi gerçekleştiyse inline stilleri temizle
    if (isLandscape !== lastOrientationWasLandscape) {
        lastOrientationWasLandscape = isLandscape;
        
        if (!document.body.classList.contains('floating-panels-active')) {
            document.querySelectorAll('.dynamic-field').forEach(panel => {
                panel.style.removeProperty('width');
                panel.style.removeProperty('height');
                panel.style.removeProperty('top');
                panel.style.removeProperty('left');
                panel.style.removeProperty('bottom');
                panel.style.removeProperty('right');
                
                const contentWrapper = panel.querySelector('.panel-content-wrapper');
                if (contentWrapper) {
                    contentWrapper.style.removeProperty('zoom');
                }
            });
        }
    }






});
