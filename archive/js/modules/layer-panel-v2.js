/**
 * EmlakStüdyom - Layer Panel v2  (DÜZELTME 2 - Performans + Güvenilir Sıralama)
 *
 * Düzeltmeler:
 *  - MutationObserver artık SADECE childList dinliyor (attribute değil) → freeze yok
 *  - Her satırda ↑↓ butonları → güvenilir sıralama
 *  - Drag-and-drop tamamen yeniden yazıldı (pointer events ile, HTML5 D&D değil)
 *  - Z-index ataması 500-999 aralığında (şablon 1-100, kullanıcı 500+)
 *  - Refresh debounce 400ms → titreme yok
 */
(function () {
    'use strict';

    /* ════════════════════════════════════════
       SABITLER
    ════════════════════════════════════════ */
    const Z_BASE  = 500;   // kullanıcı elemanları bu z'den başlar
    const Z_STEP  = 10;    // her katman 10 artıyor
    const REFRESH_DELAY = 400;

    /* ════════════════════════════════════════
       YARDIMCI: Element koleksiyonu
    ════════════════════════════════════════ */
    function collectElements() {
        const seen = new Set();
        const els  = [];
        const SELS = [
            '.callout-wrap', '.svg-callout',
            '.icon-wrap', '.canvas-el', '.editable-text'
        ];
        SELS.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (seen.has(el)) return;
                if (el.classList.contains('icon-item') &&
                    el.parentElement?.classList.contains('icon-wrap')) return;
                if (el.tagName === 'STYLE' || el.tagName === 'SCRIPT') return;

                // ── Sistem tarafından gizli elemanları panelden çıkar ──
                // Kullanıcı göz ile gizlemediyse (data-layerHidden yok):
                if (el.dataset.layerHidden !== 'true') {
                    // visibility:hidden = sistem gizli (elBadge, elPrice, vb.)
                    if (el.style.visibility === 'hidden') return;
                    // display:none = sistem gizli ama kullanıcının lp-id'si yoksa skip
                    if (el.style.display === 'none' && !el.dataset.lpId) return;
                }

                seen.add(el);
                els.push(el);
            });
        });
        // Yüksek z-index önde (panelde üstte), eşit z-index'te callout-wrap'lar önce
        els.sort((a, b) => {
            const zA = parseInt(a.style.zIndex) || parseInt(getComputedStyle(a).zIndex) || 0;
            const zB = parseInt(b.style.zIndex) || parseInt(getComputedStyle(b).zIndex) || 0;
            if (zB !== zA) return zB - zA;
            // Eşit z-index: callout/svg olanlar daha önce
            const aIsCallout = a.classList.contains('callout-wrap') || a.classList.contains('svg-callout');
            const bIsCallout = b.classList.contains('callout-wrap') || b.classList.contains('svg-callout');
            return bIsCallout ? 1 : aIsCallout ? -1 : 0;
        });
        return els;
    }

    /* ════════════════════════════════════════
       YARDIMCI: Tip bilgisi
    ════════════════════════════════════════ */
    function getMeta(el) {
        if (el.classList.contains('callout-wrap') || el.classList.contains('svg-callout'))
            return { icon: '🏷️', label: el.dataset.layerName || 'Rozet: Şekil' };
        if (el.classList.contains('co-neon-block'))
            return { icon: '✨', label: el.dataset.layerName || ('Rozet: ' + el.textContent.trim().substring(0, 15)) };
        if (el.classList.contains('icon-wrap') || el.classList.contains('icon-item') ||
            (el.tagName === 'I' && el.classList.contains('canvas-el')))
            return { icon: '⭐', label: el.dataset.layerName || el.dataset.label || 'İkon' };
        if (el.id === 'elBadge')  return { icon: '🏷️', label: el.dataset.layerName || 'Durum Etiketi' };
        if (el.id === 'elPrice')  return { icon: '💰', label: el.dataset.layerName || 'Fiyat' };
        if (el.id === 'elDetails')return { icon: '📋', label: el.dataset.layerName || 'Detaylar' };
        if (el.id === 'elLogo')   return { icon: '🏢', label: el.dataset.layerName || 'Firma Logosu' };
        if (el.classList.contains('editable-text') || el.classList.contains('custom-text'))
            return { icon: '📝', label: el.dataset.layerName || el.dataset.label || ('Yazı: ' + el.textContent.trim().substring(0,15)) };
        if (el.dataset.label) return { icon: '🎯', label: el.dataset.layerName || el.dataset.label };
        return { icon: '🔲', label: el.dataset.layerName || 'Nesne' };
    }

    /* ════════════════════════════════════════
       YARDIMCI: Seçili mi?
    ════════════════════════════════════════ */
    function isActive(el) {
        if (typeof selectedEl !== 'undefined' && (selectedEl === el || el.contains?.(selectedEl))) return true;
        if (typeof selectedCalloutEl !== 'undefined' && selectedCalloutEl &&
            (selectedCalloutEl === el || el.contains?.(selectedCalloutEl))) return true;
        return false;
    }

    /* ════════════════════════════════════════
       YARDIMCI: Kalıcı ID
    ════════════════════════════════════════ */
    function stableId(el) {
        if (!el.dataset.lpId) el.dataset.lpId = 'lp_' + Math.random().toString(36).substr(2, 9);
        return el.dataset.lpId;
    }

    /* ════════════════════════════════════════
       YARDIMCI: Tüm z-index'leri sırayla uygula
       Paneldeki sıra = z-index değeri
       Üstteki öğe → yüksek z (Z_BASE + n*Z_STEP)
    ════════════════════════════════════════ */
    function applyZOrder(orderedEls) {
        // orderedEls[0] = en üstteki → en yüksek z
        const n = orderedEls.length;
        orderedEls.forEach((el, i) => {
            const z = Z_BASE + (n - 1 - i) * Z_STEP;
            el.style.zIndex = String(z);
        });
    }

    /* ════════════════════════════════════════
       ANA SINIF
    ════════════════════════════════════════ */
    class LayerPanel {
        constructor() {
            this.listEl     = null;
            this.elements   = [];    // mevcut sıra (en üstteki [0])
            this._timer     = null;
            this._observer  = null;
            this._dragging  = null;  // sürüklenen {el, itemEl, origIdx}
            this._dragY     = 0;
            this._placeholder = null;
        }

        /* ── Başlat ───────────────────────────── */
        init() {
            const try_ = () => {
                const tab = document.getElementById('tab-layers');
                if (!tab) { setTimeout(try_, 300); return; }
                this._buildUI(tab);
                this._startObserver();
                this.refresh();
                console.log('✅ LayerPanelV2 aktif (v2.1)');
            };
            try_();
        }

        /* ── Panel HTML'i ─────────────────────── */
        _buildUI(tabEl) {
            tabEl.innerHTML = `
<div id="layerPanelV2">
  <div class="lp-header">
    <div class="lp-header-title">
      <i class="fa-solid fa-layer-group"></i>
      Katmanlar
      <span class="lp-count" id="lpCount">0</span>
    </div>
    <button class="lp-refresh-btn" onclick="window.LayerPanelV2.refresh()" title="Yenile">
      <i class="fa-solid fa-rotate-right"></i>
    </button>
  </div>

  <div id="lpLayersList"></div>

  <div class="lp-actions">
      <div class="lp-action-row" id="lpGroupActions" style="display:none; justify-content: space-between; margin-bottom: 5px;">
        <button class="lp-btn" style="background:#3b82f6; color:white; width:48%" onclick="window.groupSelected()" id="lpBtnGroup">🔗 Grupla</button>
        <button class="lp-btn" style="background:#eab308; color:white; width:48%; display:none;" onclick="window.ungroupSelected()" id="lpBtnUngroup">✂️ Çöz</button>
      </div>
      <div class="lp-action-row">
      <button class="lp-btn" onclick="window.LayerPanelV2.moveUp()" title="Bir üst katmana">
        <i class="fa-solid fa-arrow-up"></i> İleri
      </button>
      <button class="lp-btn" onclick="window.LayerPanelV2.moveDown()" title="Bir alt katmana">
        <i class="fa-solid fa-arrow-down"></i> Geri
      </button>
      <button class="lp-btn" onclick="window.LayerPanelV2.moveToFront()" title="En öne">
        <i class="fa-solid fa-angles-up"></i> Öne
      </button>
      <button class="lp-btn" onclick="window.LayerPanelV2.moveToBack()" title="En arkaya">
        <i class="fa-solid fa-angles-down"></i> Arka
      </button>
    </div>
    <div class="lp-action-row">
      <button class="lp-btn" onclick="window.LayerPanelV2.duplicateSelected()" title="Kopyala">
        <i class="fa-solid fa-copy"></i> Kopyala
      </button>
      <button class="lp-btn danger" onclick="window.LayerPanelV2.deleteSelected()" title="Sil">
        <i class="fa-solid fa-trash"></i> Sil
      </button>
    </div>
  </div>
</div>`;
            this.listEl = document.getElementById('lpLayersList');
        }

        /* ── MutationObserver: SADECE childList ── */
        _startObserver() {
            if (this._observer) this._observer.disconnect();
            const targets = [
                document.getElementById('ui-layer'),
                document.getElementById('canvas-container')
            ].filter(Boolean);
            if (!targets.length) return;
            this._observer = new MutationObserver(() => this._scheduleRefresh());
            targets.forEach(t => this._observer.observe(t, {
                childList: true,
                subtree: false
                // attributes KAPATILDI — z-index değişimleri infinite loop yapıyordu
            }));
        }

        _scheduleRefresh() {
            clearTimeout(this._timer);
            this._timer = setTimeout(() => this.refresh(), REFRESH_DELAY);
        }

        /* ════════════════════════════════════════
           RENDER
        ════════════════════════════════════════ */
        refresh() {
            if (!this.listEl) {
                this.listEl = document.getElementById('lpLayersList');
                if (!this.listEl) return;
            }

            this.elements = collectElements();
            const count = document.getElementById('lpCount');
            if (count) count.textContent = this.elements.length;

            if (!this.elements.length) {
                this.listEl.innerHTML = `
<div class="lp-empty">
  <i class="fa-solid fa-layer-group"></i>
  <span>Henüz nesne eklenmedi.<br>Rozet, ikon veya yazı ekleyin.</span>
</div>`;
                return;
            }

            this.listEl.innerHTML = '';

            
let currentGroupId = null;
let currentGroupContainer = null;
let groupCounter = 1;

this.elements.forEach((el, idx) => {
    const id      = stableId(el);
    const meta    = getMeta(el);
    const active  = isActive(el);
    const locked  = el.dataset.locked === 'true';
    const hidden  = el.dataset.layerHidden === 'true';
    const zVal    = parseInt(el.style.zIndex) || parseInt(getComputedStyle(el).zIndex) || 0;
    
    const groupId = el.dataset.groupId;

    const item = document.createElement('div');
    item.className = 'lp-item' +
        (active ? ' active' : '') +
        (locked ? ' locked' : '') +
        (hidden ? ' hidden-layer' : '');
    item.dataset.lpId  = id;
    item.dataset.idx   = idx;
    if(groupId) item.dataset.groupId = groupId;

    item.innerHTML = `
<span class="lp-drag-handle" title="Sürükle">⋮⋮</span>
<button class="lp-vis-btn ${hidden ? '' : 'active'}"
title="${hidden ? 'Göster' : 'Gizle'}"
data-lpid="${id}">
<i class="fa-solid ${hidden ? 'fa-eye-slash' : 'fa-eye'}"></i>
</button>
<button class="lp-lock-btn ${locked ? 'locked' : ''}"
title="${locked ? 'Kilidi Aç' : 'Kilitle'}"
data-lpid="${id}">
<i class="fa-solid ${locked ? 'fa-lock' : 'fa-lock-open'}"></i>
</button>
<span class="lp-type-icon">${meta.icon}</span>
<span class="lp-name" title="${meta.label}">${meta.label}</span>
<span class="lp-z" title="Z-Index">${zVal}</span>
`;

    // Click to select
    item.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if(btn) {
            if(btn.classList.contains('lp-lock-btn')) {
                this._toggleLock(id);
            } else if(btn.classList.contains('lp-hide-btn') || btn.querySelector('.fa-eye') || btn.querySelector('.fa-eye-slash')) {
                this._toggleHide(id);
            }
            return; // ignore for selection
        }
        const isMulti = e.ctrlKey || e.shiftKey;
        this._selectLayer(el, id, isMulti);
    });

    if (groupId) {
        if (currentGroupId !== groupId) {
            currentGroupId = groupId;
            const gHeader = document.createElement('div');
            gHeader.className = 'lp-item lp-group-header';
            gHeader.style.background = 'rgba(255,255,255,0.1)';
            gHeader.style.fontWeight = 'bold';
            gHeader.style.cursor = 'pointer';
            gHeader.innerHTML = `<span style="margin-right:10px">📁</span> <span>Grup ${groupCounter++}</span> <span style="flex:1"></span> <i class="fa-solid fa-chevron-down"></i>`;
            
            currentGroupContainer = document.createElement('div');
            currentGroupContainer.className = 'lp-group-container';
            currentGroupContainer.style.paddingLeft = '15px';
            currentGroupContainer.style.borderLeft = '2px solid rgba(255,255,255,0.1)';
            
            gHeader.onclick = () => {
                if(currentGroupContainer.style.display === 'none') {
                    currentGroupContainer.style.display = 'block';
                    gHeader.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
                } else {
                    currentGroupContainer.style.display = 'none';
                    gHeader.querySelector('.fa-chevron-down').style.transform = 'rotate(-90deg)';
                }
            };
            
            this.listEl.appendChild(gHeader);
            this.listEl.appendChild(currentGroupContainer);
        }
        currentGroupContainer.appendChild(item);
    } else {
        currentGroupId = null;
        this.listEl.appendChild(item);
    }
});

        }

        /* ════════════════════════════════════════
           SEÇİM SENKRONU
        ════════════════════════════════════════ */
        _selectLayer(lpId) {
            const el = this._findEl(lpId);
            if (!el) return;
            if (el.classList.contains('callout-wrap') || el.classList.contains('svg-callout')) {
                const inner = el.querySelector('.callout-item, .co-neon-block');
                if (inner && typeof selectCalloutEl === 'function') selectCalloutEl(inner);
            } else {
                if (typeof deselectAll    === 'function') deselectAll();
                if (typeof selectElement  === 'function') selectElement(el);
                else window.selectedEl = el;
            }
            // Panel'i hemen güncelle (tam refresh değil — sadece active class)
            setTimeout(() => this.highlightActiveLayer(), 60);
        }

        highlightActiveLayer() {
            this.listEl?.querySelectorAll('.lp-item').forEach(item => {
                const el = this._findEl(item.dataset.lpId);
                item.classList.toggle('active', el ? isActive(el) : false);
            });
        }

        /* ════════════════════════════════════════
           GÖRÜNÜRLÜK & KİLİT
        ════════════════════════════════════════ */
        _toggleVis(lpId) {
            const el = this._findEl(lpId);
            if (!el) return;

            if (el.dataset.layerHidden === 'true') {
                // Kullanıcı tekrar GÖSTER — orijinal stilleri geri yükle
                delete el.dataset.layerHidden;
                const origDisplay    = el.dataset.origDisplay ?? '';
                const origVisibility = el.dataset.origVisibility ?? '';
                el.style.display     = origDisplay;
                el.style.visibility  = origVisibility;
                delete el.dataset.origDisplay;
                delete el.dataset.origVisibility;
            } else {
                // Kullanıcı GİZLE — orijinal stilleri kaydet
                el.dataset.origDisplay    = el.style.display;
                el.dataset.origVisibility = el.style.visibility;
                el.dataset.layerHidden    = 'true';
                el.style.display          = 'none';
            }
            this._scheduleRefresh();
        }

        _toggleLock(lpId) {
            const el = this._findEl(lpId);
            if (!el) return;
            if (el.dataset.locked === 'true') {
                delete el.dataset.locked;
                el.style.pointerEvents = '';
            } else {
                el.dataset.locked = 'true';
                el.style.pointerEvents = 'none';
            }
            this._scheduleRefresh();
        }

        /* ════════════════════════════════════════
           SIRALAMA (Z-INDEX)
        ════════════════════════════════════════ */

        /** Paneldeki sırayı okuyup z-index'i güncelle */
        _syncZFromPanelOrder() {
            applyZOrder(this.elements);
            // Z badge'lerini anlık güncelle (tam refresh'e gerek yok)
            this.listEl?.querySelectorAll('.lp-item').forEach((item, i) => {
                const badge = item.querySelector('.lp-z-badge');
                if (badge) badge.textContent = Z_BASE + (this.elements.length - 1 - i) * Z_STEP;
            });
        }

        /** Satırdaki ↑↓ butonla taşı */
        _moveByDir(lpId, dir) {
            const idx = this.elements.findIndex(e => e.dataset.lpId === lpId);
            if (idx < 0) return;
            if (dir === 'up'   && idx === 0) return;            // zaten en üstte
            if (dir === 'down' && idx === this.elements.length - 1) return; // zaten en altta

            const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
            // Dizi içinde yer değiştir
            [this.elements[idx], this.elements[swapIdx]] = [this.elements[swapIdx], this.elements[idx]];
            this._syncZFromPanelOrder();
            this.refresh(); // DOM'u yeniden çiz
        }

        /** Alt panel ↑ butonu */
        moveUp() {
            const el = this._activeEl();
            if (el) this._moveByDir(stableId(el), 'up');
        }
        moveDown() {
            const el = this._activeEl();
            if (el) this._moveByDir(stableId(el), 'down');
        }
        moveToFront() {
            const el = this._activeEl();
            if (!el) return;
            const idx = this.elements.findIndex(e => e === el);
            if (idx < 0 || idx === 0) return;
            this.elements.splice(idx, 1);
            this.elements.unshift(el);
            this._syncZFromPanelOrder();
            this.refresh();
        }
        moveToBack() {
            const el = this._activeEl();
            if (!el) return;
            const idx = this.elements.findIndex(e => e === el);
            if (idx < 0 || idx === this.elements.length - 1) return;
            this.elements.splice(idx, 1);
            this.elements.push(el);
            this._syncZFromPanelOrder();
            this.refresh();
        }

        /* ════════════════════════════════════════
           SİLME & KOPYALAMA
        ════════════════════════════════════════ */
        deleteSelected() {
            const el = this._activeEl();
            if (!el || el.dataset.locked === 'true') return;
            if (!confirm('Bu katmanı silmek istediğinize emin misiniz?')) return;
            el.remove();
            if (typeof window.selectedEl !== 'undefined') window.selectedEl = null;
            if (typeof window.selectedCalloutEl !== 'undefined') window.selectedCalloutEl = null;
            this._scheduleRefresh();
        }

        duplicateSelected() {
            const el = this._activeEl();
            if (!el) return;
            const clone = el.cloneNode(true);
            delete clone.dataset.lpId;
            clone.id = '';
            clone.style.left = (parseInt(clone.style.left || 0) + 20) + 'px';
            clone.style.top  = (parseInt(clone.style.top  || 0) + 20) + 'px';
            clone.style.zIndex = String(Z_BASE + this.elements.length * Z_STEP + 50);
            el.parentNode.appendChild(clone);
            if (typeof makeDraggable === 'function') makeDraggable(clone);
            this._scheduleRefresh();
        }

        /* ════════════════════════════════════════
           YENİDEN ADLANDIRMA
        ════════════════════════════════════════ */
        _startRename(lpId, span) {
            const el = this._findEl(lpId);
            if (!el) return;
            const old = span.textContent;
            const inp = document.createElement('input');
            inp.type  = 'text';
            inp.value = old;
            inp.className = 'lp-name-input';
            span.replaceWith(inp);
            inp.focus(); inp.select();
            const done = () => {
                const val = inp.value.trim() || old;
                el.dataset.layerName = val;
                this._scheduleRefresh();
            };
            inp.addEventListener('blur', done);
            inp.addEventListener('keydown', e => {
                if (e.key === 'Enter')  { e.preventDefault(); inp.blur(); }
                if (e.key === 'Escape') { inp.value = old; inp.blur(); }
            });
        }

        /* ════════════════════════════════════════
           SÜRÜKLE-BIRAK (Pointer Events — daha güvenilir)
        ════════════════════════════════════════ */
        _onDragStart(e, lpId, itemEl, origIdx) {
            e.preventDefault();
            const listRect = this.listEl.getBoundingClientRect();

            // Placeholder oluştur
            this._placeholder = document.createElement('div');
            this._placeholder.className = 'lp-drop-placeholder';
            this._placeholder.style.height = itemEl.offsetHeight + 'px';

            this._dragging = { lpId, itemEl, origIdx, newIdx: origIdx };

            // Öğeyi yarı saydam yap
            itemEl.style.opacity = '0.35';
            itemEl.style.pointerEvents = 'none';

            const onMove = ev => {
                ev.preventDefault();
                const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;

                // Hangi item üzerinde?
                const items = Array.from(this.listEl.querySelectorAll('.lp-item:not(.dragging-src)'));
                let insertBefore = null;
                let newIdx = this.elements.length; // varsayılan: en sona

                for (let i = 0; i < items.length; i++) {
                    if (items[i] === itemEl) continue;
                    const rect = items[i].getBoundingClientRect();
                    if (clientY < rect.top + rect.height / 2) {
                        insertBefore = items[i];
                        // insertBefore'un data-idx'i (refresh sonrasında sıraya göre)
                        newIdx = parseInt(items[i].dataset.idx);
                        break;
                    }
                }

                // Placeholder'ı yerleştir
                if (insertBefore) {
                    this.listEl.insertBefore(this._placeholder, insertBefore);
                } else {
                    this.listEl.appendChild(this._placeholder);
                }
                this._dragging.newIdx = newIdx;
            };

            const onUp = ev => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onUp);

                itemEl.style.opacity = '';
                itemEl.style.pointerEvents = '';
                if (this._placeholder) this._placeholder.remove();
                this._placeholder = null;

                const { origIdx, newIdx } = this._dragging;
                this._dragging = null;

                if (newIdx !== origIdx) {
                    // Diziyi yeniden düzenle
                    const el = this.elements.splice(origIdx, 1)[0];
                    const targetIdx = newIdx > origIdx ? newIdx - 1 : newIdx;
                    this.elements.splice(targetIdx, 0, el);
                    this._syncZFromPanelOrder();
                }

                this.refresh();
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup',   onUp);
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend',  onUp);
        }

        /* ════════════════════════════════════════
           YARDIMCI
        ════════════════════════════════════════ */
        _findEl(lpId) {
            return this.elements.find(e => e.dataset.lpId === lpId) || null;
        }
        _activeEl() {
            return this.elements.find(e => isActive(e)) || null;
        }
    }

    /* ════════════════════════════════════════
       BAŞLAT & GLOBAL BAĞLANTI
    ════════════════════════════════════════ */
    window.LayerPanelV2 = new LayerPanel();

    // selectElement hook: canvas'ta seçim değişince paneli senkronize et
    const _origSel = window.selectElement;
    if (typeof _origSel === 'function') {
        window.selectElement = function (...args) {
        _origSel(...args);
        setTimeout(() => window.LayerPanelV2?.highlightActiveLayer(), 80);
    };
    }

    // Panel açık olduğunda mouse bırakınca senkronize et
    document.addEventListener('mouseup', () => {
        const btn = document.querySelector('#mainTabs .tab-btn.active');
        if (btn?.dataset.tab === 'layers') {
            setTimeout(() => window.LayerPanelV2?.highlightActiveLayer(), 100);
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.LayerPanelV2.init());
    } else {
        setTimeout(() => window.LayerPanelV2.init(), 150);
    }

    console.log('📚 LayerPanelV2 v2.1 modülü yüklendi');
})();
