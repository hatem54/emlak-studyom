// ==================== EVENTS CORE ====================
// Global Event Delegates

// Yardımcı Fonksiyon: Zarif, Kompakt & Yüzer Obje Sağ Tık Menüsü
// Yardımcı Fonksiyon: Zarif, Kompakt & Yüzer Obje Sağ Tık Menüsü
function openObjectContextMenu(targetElement, isText, clientX, clientY) {
    if (!targetElement) return;

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

    // Katman Sırası: En Öne / En Arkaya
    html += `
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
        <div style="height: 1px; background: rgba(255,255,255,0.06); margin: 2px 0;"></div>
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
        if (!menu.contains(e.target)) closeMenu();
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

    // Event Handlers
    const delBtn = menu.querySelector('#acm-delete');
    if (delBtn) {
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
            targetElement.remove();
            if (typeof updateDrawHistory === 'function') updateDrawHistory();
            if (typeof deselectAll === 'function') deselectAll();
            if (typeof renderLayers === 'function') renderLayers();
        });
    }

    const lockBtn = menu.querySelector('#acm-lock');
    if (lockBtn) {
        lockBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
            if (!targetElement.dataset.layerUid) {
                targetElement.dataset.layerUid = 'layer_' + Math.random().toString(36).substr(2, 9);
            }
            if (typeof window.layerToggleLock === 'function') {
                window.layerToggleLock(targetElement.dataset.layerUid);
            }
        });
    }

    const frontBtn = menu.querySelector('#acm-front');
    if (frontBtn) {
        frontBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
            const parent = targetElement.parentElement;
            if (parent) parent.appendChild(targetElement);
            if (typeof updateDrawHistory === 'function') updateDrawHistory();
            if (typeof renderLayers === 'function') renderLayers();
        });
    }

    const backBtn = menu.querySelector('#acm-back');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
            const parent = targetElement.parentElement;
            if (parent && parent.firstChild) parent.insertBefore(targetElement, parent.firstChild);
            if (typeof updateDrawHistory === 'function') updateDrawHistory();
            if (typeof renderLayers === 'function') renderLayers();
        });
    }

    const editBtn = menu.querySelector('#acm-edit');
    if (editBtn) {
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
            const textEl = targetElement.querySelector('.callout-text, .co-neon-text, span, div') || targetElement;
            const curVal = textEl.innerText || textEl.textContent || '';
            const newT = prompt('Metni düzenleyin:', curVal);
            if (newT !== null && newT !== undefined) {
                if (textEl !== targetElement) textEl.innerText = newT;
                else targetElement.innerText = newT;
                if (typeof updateDrawHistory === 'function') updateDrawHistory();
            }
        });
    }

    const bindPos = (id, posName) => {
        const b = menu.querySelector(id);
        if (b) {
            b.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMenu();
                window.selectedElements = [targetElement];
                if (window.multiSelectPositionOnPage) window.multiSelectPositionOnPage(posName);
            });
        }
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

    const singleDup = menu.querySelector('#acm-single-duplicate');
    if (singleDup) {
        singleDup.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
            window.selectedElements = [targetElement];
            if (window.multiSelectDuplicate) window.multiSelectDuplicate();
        });
    }
}

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
        <button class="app-context-item item-front" id="acm-multi-front">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" stroke-width="2"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>
            <span>En Öne Getir</span>
        </button>
        <button class="app-context-item item-back" id="acm-multi-back">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="7 13 12 18 17 13"/><polyline points="7 6 12 11 17 6"/></svg>
            <span>En Arkaya Gönder</span>
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
        if (!menu.contains(e.target)) closeMenu();
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
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMenu();
                fn();
            });
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
    bindBtn('#acm-multi-front', () => { if (window.multiSelectBringToFront) window.multiSelectBringToFront(); });
    bindBtn('#acm-multi-back', () => { if (window.multiSelectSendToBack) window.multiSelectSendToBack(); });
    bindBtn('#acm-multi-duplicate', () => { if (window.multiSelectDuplicate) window.multiSelectDuplicate(); });
    bindBtn('#acm-multi-delete', () => { if (window.multiSelectDelete) window.multiSelectDelete(); });
}

// 1. PC: Mouse Sağ Tık (Context Menu)
document.addEventListener('contextmenu', function(e) {
    // Tutamaç butonları, form kontrolleri veya panellere sağ tıklandığında menü açma
    if (e.target.closest && e.target.closest(
        '.callout-controls, .callout-resizer, .callout-rotator, .text-handle, .text-resize-handle, ' +
        '.text-rotate-handle, .text-delete-handle, .text-lock-handle, .draw-handle, .vertex-handle, .cbtn-del, input, button, select, textarea, .panel, .mobile-panel'
    )) {
        return;
    }

    // Çoklu seçim varken sağ tıklandıysa
    if (window.selectedElements && window.selectedElements.length > 1) {
        const clickedEl = e.target.closest('.callout-item, .callout-wrap, .co-neon-block, .canvas-icon, .draggable, .added-icon, .cvi-item, .editable-draw, .canvas-el, .cvi-badge-box, [data-layer-uid]');
        const isOneOfSelected = (clickedEl && window.selectedElements.some(sel => sel === clickedEl || sel.contains(clickedEl) || clickedEl.contains(sel))) ||
                                window.selectedElements.some(sel => sel.contains(e.target));
        if (isOneOfSelected) {
            e.preventDefault();
            openMultiSelectContextMenu(e.clientX, e.clientY);
            return;
        } else if (!clickedEl && e.target.closest('#canvas-container, .main-canvas')) {
            e.preventDefault();
            openMultiSelectContextMenu(e.clientX, e.clientY);
            return;
        }
    }

    const callout = e.target.closest('.callout-item, .callout-wrap, .co-neon-block, .canvas-icon, .draggable, .added-icon, .cvi-item, .editable-draw, .canvas-el, .cvi-badge-box, [data-layer-uid]');
    if (callout) {
        e.preventDefault();
        const isText = callout.classList.contains('callout-item') && !callout.classList.contains('callout-wrap');
        openObjectContextMenu(callout, isText, e.clientX, e.clientY);
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

// 3. Çift Tıklama (Double Click) ile Hızlı Metin / İkon Düzenleme ve Sıfırlama (PC)
document.addEventListener('dblclick', function(e) {
    const icon = e.target.closest('.added-icon, .svg-icon, .icon-wrapper');
    if (icon) {
        e.stopPropagation();
        e.preventDefault();
        let defSize = parseFloat(icon.dataset.defaultFont);
        if (!defSize || isNaN(defSize) || defSize <= 0) {
            const sf = typeof scaleFactor !== 'undefined' && scaleFactor > 0 ? scaleFactor : 1;
            defSize = Math.round(60 / sf);
        }
        icon.style.fontSize = defSize + 'px';
        icon.dataset.rotation = '0';
        const currentScale = icon.dataset.scale || 1;
        icon.style.transform = `rotate(0deg) scale(${currentScale})`;
        
        const fsSlider = document.getElementById('elFontSize') || document.getElementById('fontSize');
        if (fsSlider) fsSlider.value = defSize;
        const fsVal = document.getElementById('elFontSizeVal') || document.getElementById('fontSizeVal');
        if (fsVal) fsVal.textContent = defSize + 'px';
        
        const rotSlider = document.getElementById('elRotate');
        if (rotSlider) rotSlider.value = 0;
        const rotVal = document.getElementById('elRotateVal');
        if (rotVal) rotVal.textContent = '0°';
        
        if (typeof saveState === 'function') saveState();
        return;
    }

    const callout = e.target.closest('.callout-item');
    if (callout && !callout.classList.contains('callout-wrap')) {
        e.stopPropagation();
        openObjectContextMenu(callout, true); // Menüyü açmak daha güvenli (Sil/Düzenle)
    }
});

// Boş tuvale veya canvas zeminine tıklandığında seçimi ve tutamaçları temizle
document.addEventListener('pointerdown', function(e) {
    if (e.target.closest(
        '.draggable, .canvas-el, .callout-wrap, .callout-item, .co-neon-block, ' +
        '.text-handle, .text-resize-handle, .text-rotate-handle, .text-delete-handle, .text-lock-handle, ' +
        '.callout-controls, .callout-resizer, .callout-rotator, .callout-lock-btn, .callout-select-border, ' +
        '.draw-handle, .vertex-handle, .cbtn-del, .sidebar, .right-sidebar, .panel, .mobile-panel, ' +
        '.tab-content, .dynamic-field, .tab-btn, button, input, select, textarea, .swal2-container, .modal, .context-menu'
    )) {
        return;
    }
    if (typeof drawMode === 'undefined' || drawMode === 'off' || drawMode === null) {
        if (typeof deselectAll === 'function') deselectAll();
        if (typeof closeCalloutPanel === 'function') closeCalloutPanel();
    }
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
