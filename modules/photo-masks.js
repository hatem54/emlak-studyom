/**
 * ====================================================================
 * EmlakStüdyom Pro Mask Manager (Çoklu Maske, AI & Tuval Etkileşimi)
 * modules/photo-masks.js
 * ====================================================================
 * 
 * - Çoklu Maske Katmanları & Geçmiş (History) Yönetimi
 * - Akıllı AI Maskeleri: ☁️ Gökyüzü, 🏞️ Yeryüzü/Zemin, 🎯 Ana Öge, 👤 Kişi
 * - Tuvalden Herhangi Bir Yerden Tutarak Taşıma (Anywhere-drag)
 * - Boş Alana Tıklamada Mevcut Maskeyi Koruma (Accidental overwrite koruması)
 * - Geçiş Yayılması: %0 Keskin Sınır ↔ %100 En Saydam Yumuşak Geçiş
 */

(function(window) {
    'use strict';

    class PhotoMasksManager {
        constructor() {
            // Maske Katmanları Koleksiyonu
            this.masks = [];
            this.selectedMaskId = null;
            this.activeTool = null; // null, 'radial', 'linear', 'ai'
            this.activeMaskType = null;
            this.isGuidesVisible = false;
            this.showOverlay = true;
            this.isCreatingNew = null; // null, 'radial', 'linear'
            this.panelsCollapsed = true;

            // Sürükleme durumu
            this.isDragging = false;
            this.dragMode = null;
            this.dragStart = { x: 0, y: 0 };
            this.initialState = null;

            this.svgEl = null;
            this.containerEl = null;
            this._compositeAiCanvas = null;

            // Geriye dönük uyumluluk yedekleri
            this._fallbackRadial = {
                active: false, cx: 0.5, cy: 0.5, rx: 0.25, ry: 0.20, angle: 0,
                feather: 0.5, spread: 0.5, invert: false, exposure: 0, temp: 0,
                highlights: 0, shadows: 0, saturate: 1.0, amount: 1.0, showOverlay: true
            };
            this._fallbackLinear = {
                active: false, x1: 0.5, y1: 0.12, x2: 0.5, y2: 0.50,
                feather: 0.5, spread: 0.5, invert: false, exposure: 0, temp: 0,
                highlights: 0, shadows: 0, saturate: 1.0, amount: 1.0, showOverlay: true
            };
        }

        // ====================================================================
        // GERİYE DÖNÜK UYUMLULUK GETTER / SETTER
        // ====================================================================
        get radial() {
            const sel = this.masks.find(m => m.id === this.selectedMaskId && m.type === 'radial');
            if (sel) return { ...sel.settings, active: sel.active, showOverlay: sel.showOverlay };
            const first = this.masks.find(m => m.type === 'radial');
            if (first) return { ...first.settings, active: first.active, showOverlay: first.showOverlay };
            return this._fallbackRadial;
        }

        get linear() {
            const sel = this.masks.find(m => m.id === this.selectedMaskId && m.type === 'linear');
            if (sel) return { ...sel.settings, active: sel.active, showOverlay: sel.showOverlay };
            const first = this.masks.find(m => m.type === 'linear');
            if (first) return { ...first.settings, active: first.active, showOverlay: first.showOverlay };
            return this._fallbackLinear;
        }

        init() {
            this.svgEl = document.getElementById('maskInteractiveSvg');
            this.containerEl = document.getElementById('canvas-container');
            this.bindCanvasEvents();
            this.bindAccordionEvents();
            this.updatePanelsVisibility();
            this.renderLayersList();
            this.syncFromSelected();
            this.renderSvg();
        }

        bindAccordionEvents() {
            const acc = document.getElementById('photoMasksAccordion');
            if (acc) {
                acc.addEventListener('toggle', () => {
                    if (acc.open) {
                        const mask = this.getSelectedMask();
                        if (mask && mask.active) {
                            this.showGuides();
                        } else {
                            this.updatePanelsVisibility();
                        }
                    } else {
                        this.hideGuides();
                    }
                });
            }
        }

        getSelectedMask() {
            return this.masks.find(m => m.id === this.selectedMaskId) || null;
        }

        // ====================================================================
        // KATMAN VE GEÇMİŞ (LAYER & HISTORY) YÖNETİMİ
        // ====================================================================
        addMask(type) {
            this.isCreatingNew = null;
            // İlk açılışta pasif olan varsayılan maske varsa onu canlandır ve seç
            const defaultInactive = this.masks.find(m => m.type === type && !m.active && (m.id === 'rad_1' || m.id === 'lin_1'));
            if (defaultInactive) {
                defaultInactive.active = true;
                this.selectMask(defaultInactive.id);
                return;
            }

            if (type === 'radial') {
                const count = this.masks.filter(m => m.type === 'radial').length + 1;
                const newMask = {
                    id: 'rad_' + Date.now(),
                    type: 'radial',
                    name: 'Radyal Maske ' + count,
                    active: true,
                    showOverlay: true,
                    settings: {
                        cx: 0.5,
                        cy: 0.5,
                        rx: 0.25,
                        ry: 0.20,
                        angle: 0,
                        feather: 0.5,
                        spread: 0.5,
                        invert: false,
                        exposure: 0,
                        temp: 0,
                        highlights: 0,
                        shadows: 0,
                        saturate: 1.0,
                        amount: 1.0
                    }
                };
                this.masks.push(newMask);
                this.selectMask(newMask.id);
            } else if (type === 'linear') {
                const count = this.masks.filter(m => m.type === 'linear').length + 1;
                const newMask = {
                    id: 'lin_' + Date.now(),
                    type: 'linear',
                    name: 'Doğrusal Gradyan ' + count,
                    active: true,
                    showOverlay: true,
                    settings: {
                        x1: 0.5,
                        y1: 0.12,
                        x2: 0.5,
                        y2: 0.50,
                        feather: 0.5,
                        spread: 0.5,
                        invert: false,
                        exposure: 0,
                        temp: 0,
                        highlights: 0,
                        shadows: 0,
                        saturate: 1.0,
                        amount: 1.0
                    }
                };
                this.masks.push(newMask);
                this.selectMask(newMask.id);
            }

            this.isGuidesVisible = true;
            this.renderLayersList();
            this.renderSvg();
            this.notifyChange();
        }

        selectMask(id) {
            this.panelsCollapsed = false;
            this.selectedMaskId = id;
            const mask = this.masks.find(m => m.id === id);
            if (!mask) return;

            this.isGuidesVisible = true;
            this.showOverlay = true;
            mask.active = true;
            mask.showPin = true;

            // ÖNEMLİ KURAL: Bir maske seçilince diğer tüm maskelerin kılavuz dolgusu (showOverlay) kapatılır.
            // Sadece seçilen maskenin kılavuz dolgusu açık kalır (önceki maske ayarları fotoğrafta korunur).
            this.masks.forEach(m => {
                m.showOverlay = (m.id === id);
            });

            const globalOver = document.getElementById('maskOverlayToggle');
            if (globalOver) globalOver.checked = true;

            if (mask.type === 'radial') {
                this.activeTool = 'radial';
                this.activeMaskType = 'radial';
            } else if (mask.type === 'linear') {
                this.activeTool = 'linear';
                this.activeMaskType = 'linear';
            } else if (mask.type.startsWith('ai_')) {
                this.activeTool = 'ai';
                this.activeMaskType = mask.type;
            }

            this.updatePanelsVisibility();
            this.syncFromSelected();
            this.updateToolButtons();
            this.updateSvgPointerEvents();
            this.renderLayersList();
            this.renderSvg();
            this.notifyChange();
        }

        toggleMask(id) {
            const mask = this.masks.find(m => m.id === id);
            if (!mask) return;
            mask.active = !mask.active;
            this.renderLayersList();
            this.renderSvg();
            this.notifyChange();
        }

        deleteMask(id) {
            this.masks = this.masks.filter(m => m.id !== id);
            if (this.selectedMaskId === id) {
                this.selectedMaskId = this.masks.length > 0 ? this.masks[this.masks.length - 1].id : null;
            }
            if (this.selectedMaskId) {
                this.selectMask(this.selectedMaskId);
            } else {
                this.hideGuides();
                this.updatePanelsVisibility();
            }
            this.renderLayersList();
            this.renderSvg();
            this.notifyChange();
        }

        
        clickMaskButton(type) {
            const rCont = document.getElementById('radialMaskControls');
            const lCont = document.getElementById('linearMaskControls');
            
            // Panel şu an açık mı?
            const isCurrentlyOpen = (type === 'radial' && rCont && rCont.style.display === 'block') ||
                                    (type === 'linear' && lCont && lCont.style.display === 'block');

            if (isCurrentlyOpen) {
                // Zaten açıksa kapat ve ekrandaki işaretçiyi gizle
                this.panelsCollapsed = true;
                this.hideGuides();
                this.updatePanelsVisibility();
                return;
            }

            // Kapalıysa AÇ ve ekrandaki işaretçiyi mutlaka görünür yap
            this.panelsCollapsed = false;

            let mask = this.masks.find(m => m.type === type);
            if (!mask) {
                this.addMask(type);
                mask = this.getSelectedMask();
            } else {
                mask.active = true;
                mask.showOverlay = true;
                mask.showPin = true;
                this.selectMask(mask.id);
            }

            if (mask) {
                mask.active = true;
                mask.showOverlay = true;
                mask.showPin = true;
            }

            this.isGuidesVisible = true;
            this.activeTool = type;
            this.showGuides();
            this.updatePanelsVisibility();
            this.syncFromSelected();
            this.renderLayersList();
            this.renderSvg();
            this.notifyChange();
        }

        toggleMaskAccordion(type) {
            this.clickMaskButton(type);
        }

        openMask(type) {
            const existing = this.masks.find(m => m.type === type);
            if (existing) {
                existing.active = true;
                existing.showOverlay = true;
                existing.showPin = true;
                this.selectMask(existing.id);
            } else {
                this.addMask(type);
            }
        }

        setActiveTool(tool) {
            if (this.activeTool === tool && this.isGuidesVisible) {
                this.hideGuides();
            } else {
                this.openMask(tool);
            }
        }

        deactivateTool() {
            this.hideGuides();
        }

        hideGuides() {
            this.isGuidesVisible = false;
            this.activeTool = null;
            if (this.svgEl) this.svgEl.innerHTML = '';
            this.updateToolButtons();
            this.updateSvgPointerEvents();
            this.renderLayersList();
        }

        showGuides() {
            const mask = this.getSelectedMask();
            if (!mask) {
                this.isGuidesVisible = false;
                if (this.svgEl) this.svgEl.innerHTML = '';
                return;
            }
            this.isGuidesVisible = true;
            mask.active = true;
            mask.showPin = true;
            this.activeTool = mask.type.startsWith('ai_') ? 'ai' : mask.type;
            this.updateToolButtons();
            this.updateSvgPointerEvents();
            this.renderLayersList();
            this.renderSvg();
        }

        updatePanelsVisibility() {
            const rCont = document.getElementById('radialMaskControls');
            const lCont = document.getElementById('linearMaskControls');
            const aCont = document.getElementById('aiMaskControls');
            const btnRad = document.getElementById('btnMaskRadial');
            const btnLin = document.getElementById('btnMaskLinear');

            const mask = this.getSelectedMask();
            const type = mask ? mask.type : null;
            const collapsed = !!this.panelsCollapsed;

            if (rCont) rCont.style.display = (type === 'radial' && !collapsed) ? 'block' : 'none';
            if (lCont) lCont.style.display = (type === 'linear' && !collapsed) ? 'block' : 'none';
            if (aCont) aCont.style.display = (type && type.startsWith('ai_') && !collapsed) ? 'block' : 'none';

            if (btnRad) btnRad.classList.toggle('active', type === 'radial' && !collapsed);
            if (btnLin) btnLin.classList.toggle('active', type === 'linear' && !collapsed);
        }

        updateToolButtons() {
            const radBtn = document.getElementById('maskToolRadialBtn');
            const linBtn = document.getElementById('maskToolLinearBtn');
            const skyBtn = document.getElementById('maskToolSkyBtn');
            const groundBtn = document.getElementById('maskToolGroundBtn');
            const subjectBtn = document.getElementById('maskToolSubjectBtn');
            const personBtn = document.getElementById('maskToolPersonBtn');
            const statusBox = document.getElementById('maskActiveStatusBox');
            const statusText = document.getElementById('maskActiveStatusText');

            const mask = this.getSelectedMask();

            if (radBtn) radBtn.classList.toggle('active', !!(this.isGuidesVisible && mask && mask.type === 'radial'));
            if (linBtn) linBtn.classList.toggle('active', !!(this.isGuidesVisible && mask && mask.type === 'linear'));
            if (skyBtn) skyBtn.classList.toggle('active', !!(this.isGuidesVisible && mask && (mask.type === 'ai_sky' || mask.aiType === 'sky')));
            if (groundBtn) groundBtn.classList.toggle('active', !!(this.isGuidesVisible && mask && (mask.type === 'ai_ground' || mask.aiType === 'ground')));
            if (subjectBtn) subjectBtn.classList.toggle('active', !!(this.isGuidesVisible && mask && (mask.type === 'ai_subject' || mask.aiType === 'subject')));
            if (personBtn) personBtn.classList.toggle('active', !!(this.isGuidesVisible && mask && (mask.type === 'ai_person' || mask.aiType === 'person')));

            if (statusBox && statusText) {
                if (this.isGuidesVisible && mask) {
                    statusBox.style.display = 'flex';
                    if (mask.type === 'radial') {
                        statusText.innerHTML = `<b>${mask.name} Seçili:</b> Tuvalde elipsin herhangi bir yerinden tutarak taşıyın, sarı çubukla döndürün.`;
                    } else if (mask.type === 'linear') {
                        statusText.innerHTML = `<b>${mask.name} Seçili:</b> Tuvalde gradyan bandından tutarak taşıyın, uç noktalarla açısını ayarlayın.`;
                    } else {
                        statusText.innerHTML = `<b>${mask.name} Seçili:</b> Akıllı AI maskesi aktif. Kırmızı kılavuz ile seçilen alanı görün, kaydırıcılarla ışık/renk ayarlarını yapın.`;
                    }
                } else {
                    statusBox.style.display = 'none';
                }
            }
        }

        updateSvgPointerEvents() {
            if (!this.svgEl) this.svgEl = document.getElementById('maskInteractiveSvg');
            if (!this.svgEl) return;
            this.svgEl.style.pointerEvents = this.isGuidesVisible ? 'auto' : 'none';
            this.svgEl.style.cursor = 'default';
        }

        // ====================================================================
        // MASKE PARAMETRELERİ GÜNCELLEME
        // ====================================================================
        updateSelectedParam(param, value) {
            const mask = this.getSelectedMask();
            if (!mask) return;

            if (param === 'invert') {
                mask.settings.invert = !!value;
            } else if (param === 'active') {
                mask.active = !!value;
            } else if (param === 'showOverlay') {
                mask.showOverlay = !!value;
            } else {
                mask.settings[param] = parseFloat(value);
            }

            this.syncFromSelected();
            this.renderSvg();
            this.notifyChange();
        }

        updateRadialParam(param, value) {
            const mask = this.getSelectedMask();
            if (mask && mask.type === 'radial') {
                this.updateSelectedParam(param, value);
            } else {
                const first = this.masks.find(m => m.type === 'radial');
                if (first) {
                    if (param === 'invert') first.settings.invert = !!value;
                    else first.settings[param] = parseFloat(value);
                    this.renderSvg();
                    this.notifyChange();
                }
            }
        }

        updateAiParam(param, value) {
            const mask = this.getSelectedMask();
            if (mask && mask.type.startsWith('ai_')) {
                this.updateSelectedParam(param, value);
            }
        }

        updateLinearParam(param, value) {
            const mask = this.getSelectedMask();
            if (mask && mask.type === 'linear') {
                this.updateSelectedParam(param, value);
            } else {
                const first = this.masks.find(m => m.type === 'linear');
                if (first) {
                    if (param === 'invert') first.settings.invert = !!value;
                    else first.settings[param] = parseFloat(value);
                    this.renderSvg();
                    this.notifyChange();
                }
            }
        }

        toggleRadial(enable) {
            const mask = this.getSelectedMask();
            if (mask && mask.type === 'radial') {
                mask.active = (enable !== undefined) ? enable : !mask.active;
                this.renderLayersList();
                this.renderSvg();
                this.notifyChange();
            } else {
                this.openMask('radial');
            }
        }

        toggleLinear(enable) {
            const mask = this.getSelectedMask();
            if (mask && mask.type === 'linear') {
                mask.active = (enable !== undefined) ? enable : !mask.active;
                this.renderLayersList();
                this.renderSvg();
                this.notifyChange();
            } else {
                this.openMask('linear');
            }
        }

        togglePinVisibility(show) {
            const mask = this.getSelectedMask();
            if (mask) {
                mask.showPin = (show !== undefined) ? show : (mask.showPin === false ? true : false);
                const radTog = document.getElementById('mask_rad_pin_toggle');
                const linTog = document.getElementById('mask_lin_pin_toggle');
                if (radTog) radTog.checked = (mask.showPin !== false);
                if (linTog) linTog.checked = (mask.showPin !== false);
                this.renderSvg();
            }
        }

        toggleRadialOverlay(show) {
            const mask = this.getSelectedMask();
            if (mask && mask.type === 'radial') {
                mask.showOverlay = (show !== undefined) ? show : !mask.showOverlay;
                const toggle = document.getElementById('mask_rad_overlay');
                if (toggle) toggle.checked = mask.showOverlay;
                this.notifyChange();
            }
        }

        toggleLinearOverlay(show) {
            const mask = this.getSelectedMask();
            if (mask && mask.type === 'linear') {
                mask.showOverlay = (show !== undefined) ? show : !mask.showOverlay;
                const toggle = document.getElementById('mask_lin_overlay');
                if (toggle) toggle.checked = mask.showOverlay;
                this.notifyChange();
            }
        }

        toggleAiOverlay(show) {
            const mask = this.getSelectedMask();
            if (mask && mask.type.startsWith('ai_')) {
                mask.showOverlay = (show !== undefined) ? show : !mask.showOverlay;
                const toggle = document.getElementById('mask_ai_overlay');
                if (toggle) toggle.checked = mask.showOverlay;
                this.notifyChange();
            }
        }

        toggleOverlay(show) {
            this.showOverlay = (show !== undefined) ? show : !this.showOverlay;
            const toggle = document.getElementById('maskOverlayToggle');
            if (toggle) toggle.checked = this.showOverlay;

            const mask = this.getSelectedMask();
            if (mask) {
                mask.showOverlay = this.showOverlay;
            }
            this.notifyChange();
        }

        notifyChange() {
            if (typeof window.applyPhotoFilters === 'function') {
                window.applyPhotoFilters();
            }
        }

        // ====================================================================
        // INPUT SENKRONİZASYONU
        // ====================================================================
        syncFromSelected() {
            const mask = this.getSelectedMask();
            if (!mask) return;

            const setVal = (id, val, suffix = '') => {
                const el = document.getElementById(id);
                if (el) el.value = val;
                const v = document.getElementById(id + 'Val');
                if (v) v.textContent = val + suffix;
            };

            const s = mask.settings;

            if (mask.type === 'radial') {
                setVal('mask_rad_cx', Math.round(s.cx * 100), '%');
                setVal('mask_rad_cy', Math.round(s.cy * 100), '%');
                setVal('mask_rad_rx', Math.round(s.rx * 100), '%');
                setVal('mask_rad_ry', Math.round(s.ry * 100), '%');
                setVal('mask_rad_angle', Math.round(s.angle || 0), '°');
                setVal('mask_rad_feather', Math.round((s.feather !== undefined ? s.feather : 0.5) * 100), '%');
                setVal('mask_rad_spread', Math.round((s.spread !== undefined ? s.spread : 0.5) * 100), '%');
                setVal('mask_rad_amount', Math.round((s.amount !== undefined ? s.amount : 1.0) * 100), '%');
                setVal('mask_rad_exp', Math.round(s.exposure * 100));
                setVal('mask_rad_temp', Math.round(s.temp * 100));
                setVal('mask_rad_hl', Math.round(s.highlights * 100));
                setVal('mask_rad_sh', Math.round(s.shadows * 100));
                setVal('mask_rad_sat', Math.round(s.saturate * 100), '%');

                const inv = document.getElementById('mask_rad_invert');
                if (inv) inv.checked = !!s.invert;
                const over = document.getElementById('mask_rad_overlay');
                if (over) over.checked = !!mask.showOverlay;
                const pinTog = document.getElementById('mask_rad_pin_toggle');
                if (pinTog) pinTog.checked = (mask.showPin !== false);
                const tog = document.getElementById('radialMaskToggle');
                if (tog) tog.checked = !!mask.active;
            } else if (mask.type === 'linear') {
                setVal('mask_lin_x1', Math.round(s.x1 * 100), '%');
                setVal('mask_lin_y1', Math.round(s.y1 * 100), '%');
                setVal('mask_lin_x2', Math.round(s.x2 * 100), '%');
                setVal('mask_lin_y2', Math.round(s.y2 * 100), '%');
                setVal('mask_lin_feather', Math.round((s.feather !== undefined ? s.feather : 0.5) * 100), '%');
                setVal('mask_lin_spread', Math.round((s.spread !== undefined ? s.spread : 0.5) * 100), '%');
                setVal('mask_lin_amount', Math.round((s.amount !== undefined ? s.amount : 1.0) * 100), '%');
                setVal('mask_lin_exp', Math.round(s.exposure * 100));
                setVal('mask_lin_temp', Math.round(s.temp * 100));
                setVal('mask_lin_hl', Math.round(s.highlights * 100));
                setVal('mask_lin_sh', Math.round(s.shadows * 100));
                setVal('mask_lin_sat', Math.round(s.saturate * 100), '%');

                const inv = document.getElementById('mask_lin_invert');
                if (inv) inv.checked = !!s.invert;
                const over = document.getElementById('mask_lin_overlay');
                if (over) over.checked = !!mask.showOverlay;
                const linPinTog = document.getElementById('mask_lin_pin_toggle');
                if (linPinTog) linPinTog.checked = (mask.showPin !== false);
                const tog = document.getElementById('linearMaskToggle');
                if (tog) tog.checked = !!mask.active;
            } else if (mask.type.startsWith('ai_')) {
                setVal('mask_ai_amount', Math.round((s.amount !== undefined ? s.amount : 1.0) * 100), '%');
                setVal('mask_ai_exp', Math.round(s.exposure * 100));
                setVal('mask_ai_temp', Math.round(s.temp * 100));
                setVal('mask_ai_hl', Math.round(s.highlights * 100));
                setVal('mask_ai_sh', Math.round(s.shadows * 100));
                setVal('mask_ai_sat', Math.round(s.saturate * 100), '%');

                const inv = document.getElementById('mask_ai_invert');
                if (inv) inv.checked = !!s.invert;
                const over = document.getElementById('mask_ai_overlay');
                if (over) over.checked = !!mask.showOverlay;
                const title = document.getElementById('aiMaskTitle');
                if (title) title.textContent = mask.name;
            }
        }

        // ====================================================================
        // KATMANLAR / GEÇMİŞ (LAYERS & HISTORY) LİSTESİ ARAYÜZÜ
        // ====================================================================
        renderLayersList() {
            const listEl = document.getElementById('maskLayersList');
            if (!listEl) return;

            if (this.masks.length === 0) {
                listEl.innerHTML = '<div class="mask-layers-empty">Henüz maske eklenmedi. Yukarıdaki butonlardan ekleyebilirsiniz.</div>';
                return;
            }

            let html = '';
            this.masks.forEach(mask => {
                const isSelected = (mask.id === this.selectedMaskId);
                let icon = '⭕';
                if (mask.type === 'linear') icon = '➖';
                else if (mask.type === 'ai_sky') icon = '☁️';
                else if (mask.type === 'ai_ground') icon = '🏞️';
                else if (mask.type === 'ai_subject') icon = '🎯';
                else if (mask.type === 'ai_person') icon = '👤';

                html += `
                    <div class="mask-layer-row ${isSelected ? 'selected' : ''}" onclick="window.PhotoMasksManager && window.PhotoMasksManager.selectMask('${mask.id}')">
                        <div class="mask-layer-info">
                            <span class="mask-layer-icon">${icon}</span>
                            <span class="mask-layer-title">${mask.name}</span>
                            ${isSelected ? '<span class="mask-layer-badge">Seçili</span>' : ''}
                        </div>
                        <div class="mask-layer-actions" onclick="event.stopPropagation();">
                            <button type="button" class="mask-action-eye-btn ${mask.active ? 'active' : ''}" onclick="window.PhotoMasksManager && window.PhotoMasksManager.toggleMask('${mask.id}')" title="${mask.active ? 'Maske Etkisini Kapat' : 'Maske Etkisini Aç'}">
                                <i class="fa-solid ${mask.active ? 'fa-eye' : 'fa-eye-slash'}"></i>
                            </button>
                            <button type="button" class="mask-action-del-btn" onclick="window.PhotoMasksManager && window.PhotoMasksManager.deleteMask('${mask.id}')" title="Maskeyi Sil">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                `;
            });

            listEl.innerHTML = html;
        }

        // ====================================================================
        // AKILLI AI SEGMENTASYON MOTORU (Sky, Ground, Subject, Person)
        // ====================================================================
        createAiMask(aiType) {
            const sourceImg = (window.WebGLPhotoEngine && window.WebGLPhotoEngine.currentImage) ||
                              window._globalNativeImg ||
                              (document.getElementById('photo-layer') && document.getElementById('photo-layer')._nativeImg);

            if (!sourceImg || (!sourceImg.naturalWidth && !sourceImg.width)) {
                alert('Akıllı AI maskesi oluşturmak için lütfen önce bir fotoğraf yükleyin.');
                return;
            }

            // Eğer bu türe ait bir maske zaten varsa, mükerrer katman açmak yerine ona odaklan ve aktifleştir
            const existing = this.masks.find(m => m.type === ('ai_' + aiType) || m.aiType === aiType);
            if (existing) {
                existing.active = true;
                this.selectMask(existing.id);
                return;
            }

            let canvas = null;
            let name = 'AI Maskesi';

            if (aiType === 'sky') {
                canvas = this.detectSkyMask(sourceImg);
                name = 'Gökyüzü Maskesi';
            } else if (aiType === 'ground') {
                canvas = this.detectGroundMask(sourceImg);
                name = 'Zemin / Bahçe Maskesi';
            } else if (aiType === 'subject') {
                canvas = this.detectSubjectMask(sourceImg);
                name = 'Ana Öge / Mülk Maskesi';
            } else if (aiType === 'person') {
                canvas = this.detectPersonMask(sourceImg);
                name = 'Kişi / Portre Maskesi';
            }

            if (!canvas) return;

            const id = 'ai_' + aiType + '_' + Date.now();
            const newMask = {
                id: id,
                type: 'ai_' + aiType,
                aiType: aiType,
                name: name,
                active: true,
                showOverlay: true,
                aiMaskCanvas: canvas,
                settings: {
                    exposure: 0,
                    temp: 0,
                    highlights: 0,
                    shadows: 0,
                    saturate: 1.0,
                    amount: 1.0,
                    invert: false
                }
            };

            this.masks.push(newMask);
            this.selectMask(newMask.id);
            this.renderLayersList();
            this.notifyChange();
        }

        redetectCurrentAiMask() {
            const mask = this.getSelectedMask();
            if (!mask || !mask.type.startsWith('ai_')) return;
            const sourceImg = (window.WebGLPhotoEngine && window.WebGLPhotoEngine.currentImage) ||
                              window._globalNativeImg ||
                              (document.getElementById('photo-layer') && document.getElementById('photo-layer')._nativeImg);
            if (!sourceImg) return;

            if (mask.aiType === 'sky') mask.aiMaskCanvas = this.detectSkyMask(sourceImg);
            else if (mask.aiType === 'ground') mask.aiMaskCanvas = this.detectGroundMask(sourceImg);
            else if (mask.aiType === 'subject') mask.aiMaskCanvas = this.detectSubjectMask(sourceImg);
            else if (mask.aiType === 'person') mask.aiMaskCanvas = this.detectPersonMask(sourceImg);

            this.notifyChange();
        }

        // ====================================================================
        // 1. GERÇEK GÖKYÜZÜ SEGMENTASYONU (Kenar Korumalı Tohum Genişletme)
        // ====================================================================
        detectSkyMask(sourceImg) {
            const width = 400;
            const height = Math.round(width * (sourceImg.naturalHeight || sourceImg.height || 300) / (sourceImg.naturalWidth || sourceImg.width || 400));
            const c = document.createElement('canvas');
            c.width = width;
            c.height = height;
            const ctx = c.getContext('2d');
            ctx.drawImage(sourceImg, 0, 0, width, height);
            const imgData = ctx.getImageData(0, 0, width, height);
            const data = imgData.data;

            const lum = new Float32Array(width * height);
            const grad = new Float32Array(width * height);

            // A. Parlaklık (Luminance) Hesabı
            for (let i = 0; i < width * height; i++) {
                lum[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
            }

            // B. Sobel Kenar Gradyanı (Çatı, baca, bina silueti sınırlarını çıkarır)
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const idx = y * width + x;
                    const gx = (lum[idx + 1] - lum[idx - 1]) * 0.5;
                    const gy = (lum[idx + width] - lum[idx - width]) * 0.5;
                    grad[idx] = Math.hypot(gx, gy);
                }
            }

            // C. Üst Satırlardan Gökyüzü Tohumu Belirleme (İlk %12'lik tavan)
            const seedYLimit = Math.max(3, Math.floor(height * 0.12));
            const visited = new Uint8Array(width * height);
            const queue = [];

            for (let y = 0; y < seedYLimit; y++) {
                for (let x = 0; x < width; x++) {
                    const pIdx = (y * width + x) * 4;
                    const r = data[pIdx], g = data[pIdx + 1], b = data[pIdx + 2];
                    const l = lum[y * width + x];
                    const gr = grad[y * width + x];

                    const isBlueSky = (b > r + 8 && b >= g - 8 && l > 50);
                    const isCloud = (l > 160 && Math.abs(r - g) < 35 && Math.abs(g - b) < 35);
                    const isSunset = (r > 150 && g > 90 && r > b && l > 90 && gr < 25);

                    if ((isBlueSky || isCloud || isSunset) && gr < 35) {
                        const idx = y * width + x;
                        visited[idx] = 255;
                        queue.push(idx);
                    }
                }
            }

            // Kapalı/gri gökyüzü yedeği
            if (queue.length === 0) {
                for (let y = 0; y < seedYLimit; y++) {
                    for (let x = 0; x < width; x++) {
                        const l = lum[y * width + x];
                        if (l > 165 && grad[y * width + x] < 25) {
                            const idx = y * width + x;
                            visited[idx] = 255;
                            queue.push(idx);
                        }
                    }
                }
            }

            // D. Bölge Büyütme (Region Growing / Flood Fill): Çatı ve bina bariyerlerinde kesin durur
            let head = 0;
            while (head < queue.length) {
                const curr = queue[head++];
                const cx = curr % width;
                const cy = Math.floor(curr / width);

                const neighbors = [
                    cy > 0 ? curr - width : -1,
                    cy < height - 1 ? curr + width : -1,
                    cx > 0 ? curr - 1 : -1,
                    cx < width - 1 ? curr + 1 : -1
                ];

                for (let n = 0; n < 4; n++) {
                    const nIdx = neighbors[n];
                    if (nIdx < 0 || visited[nIdx] > 0) continue;

                    const ny = Math.floor(nIdx / width);

                    // Güçlü çatı veya bina kenarında dur
                    if (grad[nIdx] > 38 && ny > seedYLimit) continue;

                    const pIdx = nIdx * 4;
                    const r = data[pIdx], g = data[pIdx + 1], b = data[pIdx + 2];
                    const l = lum[nIdx];

                    // Ağaç yeşilliği, kiremit veya bina cephesine sızmayı engelle
                    const isFoliage = (g > r + 20 && g > b + 15 && l < 180);
                    const isBuildingBrick = (r > b + 40 && r > g + 15 && l < 165);
                    const isDarkStructure = (l < 45);

                    if (isFoliage || isBuildingBrick || isDarkStructure) continue;

                    const isBlueSky = (b > r - 5 && b >= g - 15 && l > 40);
                    const isCloud = (l > 140 && Math.abs(r - g) < 45 && Math.abs(g - b) < 45);
                    const isSunset = (r > 120 && g > 75 && l > 80 && grad[nIdx] < 30);

                    if (isBlueSky || isCloud || isSunset) {
                        visited[nIdx] = 255;
                        queue.push(nIdx);
                    }
                }
            }

            const outCanvas = document.createElement('canvas');
            outCanvas.width = width;
            outCanvas.height = height;
            const outCtx = outCanvas.getContext('2d');
            const outImgData = outCtx.createImageData(width, height);
            const outData = outImgData.data;

            // Gerçek gökyüzü alanını tam güçle (%100) doldur
            for (let i = 0; i < width * height; i++) {
                const val = visited[i];
                const pIdx = i * 4;
                outData[pIdx] = val;
                outData[pIdx + 1] = val;
                outData[pIdx + 2] = val;
                outData[pIdx + 3] = val;
            }
            outCtx.putImageData(outImgData, 0, 0);
            return outCanvas;
        }

        // ====================================================================
        // 2. GERÇEK ZEMİN / PEYZAJ / YOL SEGMENTASYONU
        // ====================================================================
        detectGroundMask(sourceImg) {
            const width = 400;
            const height = Math.round(width * (sourceImg.naturalHeight || sourceImg.height || 300) / (sourceImg.naturalWidth || sourceImg.width || 400));
            const c = document.createElement('canvas');
            c.width = width;
            c.height = height;
            const ctx = c.getContext('2d');
            ctx.drawImage(sourceImg, 0, 0, width, height);
            const imgData = ctx.getImageData(0, 0, width, height);
            const data = imgData.data;

            const lum = new Float32Array(width * height);
            const grad = new Float32Array(width * height);

            for (let i = 0; i < width * height; i++) {
                lum[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
            }

            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const idx = y * width + x;
                    const gx = (lum[idx + 1] - lum[idx - 1]) * 0.5;
                    const gy = (lum[idx + width] - lum[idx - width]) * 0.5;
                    grad[idx] = Math.hypot(gx, gy);
                }
            }

            // Alt tabandan zemin tohumları (Çim, asfalt, kaldırım, toprak, havuz)
            const seedYStart = Math.max(0, Math.floor(height * 0.88));
            const visited = new Uint8Array(width * height);
            const queue = [];

            for (let y = seedYStart; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pIdx = (y * width + x) * 4;
                    const r = data[pIdx], g = data[pIdx + 1], b = data[pIdx + 2];
                    const l = lum[y * width + x];

                    const isLawn = (g > r - 10 && g > b + 10 && l > 25);
                    const isPavement = (Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && l > 35 && l < 210);
                    const isEarth = (r > b + 10 && g > b && l > 30 && l < 190);
                    const isPool = (b > r + 25 && g > r + 10);

                    if (isLawn || isPavement || isEarth || isPool) {
                        const idx = y * width + x;
                        visited[idx] = 255;
                        queue.push(idx);
                    }
                }
            }

            // Bölge büyütme: Bina temeline, duvara veya ufka kadar ilerler
            let head = 0;
            while (head < queue.length) {
                const curr = queue[head++];
                const cx = curr % width;
                const cy = Math.floor(curr / width);

                const neighbors = [
                    cy > 0 ? curr - width : -1,
                    cy < height - 1 ? curr + width : -1,
                    cx > 0 ? curr - 1 : -1,
                    cx < width - 1 ? curr + 1 : -1
                ];

                for (let n = 0; n < 4; n++) {
                    const nIdx = neighbors[n];
                    if (nIdx < 0 || visited[nIdx] > 0) continue;

                    const ny = Math.floor(nIdx / width);

                    // Bina temeli veya kaldırım sınırında dur
                    if (grad[nIdx] > 40 && ny < seedYStart) continue;

                    const pIdx = nIdx * 4;
                    const r = data[pIdx], g = data[pIdx + 1], b = data[pIdx + 2];
                    const l = lum[nIdx];

                    // Gökyüzüne taşma koruması
                    if (ny < height * 0.45 && b > r + 15 && l > 80) continue;

                    const isLawn = (g > r - 10 && g > b + 10 && l > 25);
                    const isPavement = (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && l > 30 && l < 220);
                    const isEarth = (r > b + 10 && g > b && l > 25 && l < 200);
                    const isPool = (b > r + 20 && g > r + 8);

                    if (isLawn || isPavement || isEarth || isPool) {
                        visited[nIdx] = 255;
                        queue.push(nIdx);
                    }
                }
            }

            const outCanvas = document.createElement('canvas');
            outCanvas.width = width;
            outCanvas.height = height;
            const outCtx = outCanvas.getContext('2d');
            const outImgData = outCtx.createImageData(width, height);
            const outData = outImgData.data;

            for (let i = 0; i < width * height; i++) {
                const val = visited[i];
                const pIdx = i * 4;
                outData[pIdx] = val;
                outData[pIdx + 1] = val;
                outData[pIdx + 2] = val;
                outData[pIdx + 3] = val;
            }
            outCtx.putImageData(outImgData, 0, 0);
            return outCanvas;
        }

        // ====================================================================
        // 3. GERÇEK ANA ÖGE / MİMARİ YAPI (VİLLA / BİNA) SEGMENTASYONU
        // ====================================================================
        detectSubjectMask(sourceImg) {
            const width = 400;
            const height = Math.round(width * (sourceImg.naturalHeight || sourceImg.height || 300) / (sourceImg.naturalWidth || sourceImg.width || 400));

            // Gökyüzü ve Zemin segmentasyonlarını referans al
            const skyCanvas = this.detectSkyMask(sourceImg);
            const groundCanvas = this.detectGroundMask(sourceImg);

            const skyData = skyCanvas.getContext('2d').getImageData(0, 0, width, height).data;
            const groundData = groundCanvas.getContext('2d').getImageData(0, 0, width, height).data;

            const outCanvas = document.createElement('canvas');
            outCanvas.width = width;
            outCanvas.height = height;
            const outCtx = outCanvas.getContext('2d');
            const outImgData = outCtx.createImageData(width, height);
            const outData = outImgData.data;

            // Ana mimari yapı: Gökyüzü ile zemin arasında kalan gerçek bina gövdesi ve cephesi
            for (let i = 0; i < width * height; i++) {
                const pIdx = i * 4;
                const isSky = skyData[pIdx] > 10;
                const isGround = groundData[pIdx] > 10;

                const val = (!isSky && !isGround) ? 255 : 0;
                outData[pIdx] = val;
                outData[pIdx + 1] = val;
                outData[pIdx + 2] = val;
                outData[pIdx + 3] = val;
            }
            outCtx.putImageData(outImgData, 0, 0);
            return outCanvas;
        }

        detectPersonMask(sourceImg) {
            const width = 400;
            const height = Math.round(width * (sourceImg.naturalHeight || sourceImg.height || 300) / (sourceImg.naturalWidth || sourceImg.width || 400));
            const c = document.createElement('canvas');
            c.width = width;
            c.height = height;
            const ctx = c.getContext('2d');
            ctx.drawImage(sourceImg, 0, 0, width, height);
            const imgData = ctx.getImageData(0, 0, width, height);
            const data = imgData.data;

            const rawSkin = new Uint8Array(width * height);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];

                    const Cb = -0.1687 * r - 0.3313 * g + 0.5 * b + 128;
                    const Cr = 0.5 * r - 0.4187 * g - 0.0813 * b + 128;

                    const isSkin = (r > 95 && g > 40 && b > 20 &&
                                    (Math.max(r, g, b) - Math.min(r, g, b) > 15) &&
                                    Math.abs(r - g) > 15 && r > g && r > b &&
                                    Cb >= 77 && Cb <= 130 && Cr >= 130 && Cr <= 175);

                    if (isSkin) {
                        rawSkin[y * width + x] = 255;
                    }
                }
            }

            const outCanvas = document.createElement('canvas');
            outCanvas.width = width;
            outCanvas.height = height;
            const outCtx = outCanvas.getContext('2d');
            const outImgData = outCtx.createImageData(width, height);
            const outData = outImgData.data;

            const radius = 6;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let maxVal = 0;
                    const startY = Math.max(0, y - radius);
                    const endY = Math.min(height - 1, y + radius);
                    const startX = Math.max(0, x - radius);
                    const endX = Math.min(width - 1, x + radius);

                    for (let ny = startY; ny <= endY; ny += 2) {
                        for (let nx = startX; nx <= endX; nx += 2) {
                            if (rawSkin[ny * width + nx] > 0) {
                                const dist = Math.hypot(x - nx, y - ny);
                                if (dist <= radius) {
                                    maxVal = Math.max(maxVal, 255 - Math.round(dist * 20));
                                }
                            }
                        }
                    }

                    const idx = (y * width + x) * 4;
                    outData[idx] = maxVal;
                    outData[idx + 1] = maxVal;
                    outData[idx + 2] = maxVal;
                    outData[idx + 3] = maxVal;
                }
            }
            outCtx.putImageData(outImgData, 0, 0);
            return outCanvas;
        }

        // ====================================================================
        // WEBGL İÇİN VERİ ÇIKIŞLARI (Options Providers)
        // ====================================================================
        getActiveRadialMasks() {
            return this.masks.filter(m => m.active && m.type === 'radial').map(m => ({
                ...m.settings,
                active: true,
                showOverlay: (m.showOverlay !== undefined ? m.showOverlay : this.showOverlay)
            }));
        }

        getActiveLinearMasks() {
            return this.masks.filter(m => m.active && m.type === 'linear').map(m => ({
                ...m.settings,
                active: true,
                showOverlay: (m.showOverlay !== undefined ? m.showOverlay : this.showOverlay)
            }));
        }

        getActiveAiMasks() {
            return this.masks.filter(m => m.active && m.type.startsWith('ai_')).map(m => ({
                ...m.settings,
                active: true,
                type: m.type,
                aiType: m.aiType,
                showOverlay: (m.showOverlay !== undefined ? m.showOverlay : this.showOverlay)
            }));
        }

        getCompositeAiBuffer() {
            const activeAi = this.masks.filter(m => m.active && m.type.startsWith('ai_') && m.aiMaskCanvas);
            if (activeAi.length === 0) return null;
            const first = activeAi[0].aiMaskCanvas;
            const w = first.width;
            const h = first.height;
            const buffer = new Uint8Array(w * h * 4);

            for (let k = 0; k < Math.min(4, activeAi.length); k++) {
                const maskCanvas = activeAi[k].aiMaskCanvas;
                const mCtx = maskCanvas.getContext('2d');
                const mData = mCtx.getImageData(0, 0, w, h).data;
                for (let i = 0; i < w * h; i++) {
                    buffer[i * 4 + k] = mData[i * 4 + 3];
                }
            }
            return { width: w, height: h, data: buffer };
        }

        getCompositeAiCanvas() {
            const activeAi = this.masks.filter(m => m.active && m.type.startsWith('ai_') && m.aiMaskCanvas);
            if (activeAi.length === 0) return null;

            const first = activeAi[0].aiMaskCanvas;
            const w = first.width;
            const h = first.height;

            if (!this._compositeAiCanvas || this._compositeAiCanvas.width !== w || this._compositeAiCanvas.height !== h) {
                this._compositeAiCanvas = document.createElement('canvas');
                this._compositeAiCanvas.width = w;
                this._compositeAiCanvas.height = h;
            }
            const c = this._compositeAiCanvas;
            const ctx = c.getContext('2d');

            const imgData = ctx.createImageData(w, h);
            const d = imgData.data;

            const hasPerson = activeAi.some(m => m.type === 'ai_person');

            for (let k = 0; k < Math.min(4, activeAi.length); k++) {
                const maskCanvas = activeAi[k].aiMaskCanvas;
                const mCtx = maskCanvas.getContext('2d');
                const mData = mCtx.getImageData(0, 0, w, h).data;
                for (let i = 0; i < w * h; i++) {
                    d[i * 4 + k] = mData[i * 4 + 3];
                }
            }

            // Eğer 4. kanal (alpha) kişi maskesi olarak kullanılmıyorsa,
            // 2D canvas backing store'unun RGB'yi sıfırlamasını (zero alpha premultiplication)
            // engellemek için alpha kanalını 255'e eşitliyoruz.
            if (!hasPerson) {
                for (let i = 0; i < w * h; i++) {
                    d[i * 4 + 3] = 255;
                }
            }

            ctx.putImageData(imgData, 0, 0);
            return c;
        }

        // ====================================================================
        // TUVAL ETKİLEŞİMİ (Pointer Events & Anywhere Drag)
        // ====================================================================
        getNormalizedCoords(e) {
            if (!this.containerEl) this.containerEl = document.getElementById('canvas-container');
            const rect = this.containerEl ? this.containerEl.getBoundingClientRect() : null;
            const rw = (rect && rect.width > 0) ? rect.width : 800;
            const rh = (rect && rect.height > 0) ? rect.height : 600;
            const rLeft = rect ? rect.left : 0;
            const rTop = rect ? rect.top : 0;
            const clientX = (e && e.touches && e.touches[0]) ? e.touches[0].clientX : (e && e.clientX !== undefined ? e.clientX : 0);
            const clientY = (e && e.touches && e.touches[0]) ? e.touches[0].clientY : (e && e.clientY !== undefined ? e.clientY : 0);
            const x = Math.max(0, Math.min(1, (clientX - rLeft) / rw));
            const y = Math.max(0, Math.min(1, (clientY - rTop) / rh));
            return { x, y };
        }

        bindCanvasEvents() {
            if (!this.svgEl) this.svgEl = document.getElementById('maskInteractiveSvg');
            if (!this.svgEl) return;

            this.onPointerDown = (e) => this.handlePointerDown(e);
            this.onPointerMove = (e) => this.handlePointerMove(e);
            this.onPointerUp = (e) => this.handlePointerUp(e);

            this.svgEl.addEventListener('mousedown', this.onPointerDown);
            window.addEventListener('mousemove', this.onPointerMove);
            window.addEventListener('mouseup', this.onPointerUp);

            this.svgEl.addEventListener('touchstart', this.onPointerDown, { passive: false });
            window.addEventListener('touchmove', this.onPointerMove, { passive: false });
            window.addEventListener('touchend', this.onPointerUp);
        }

        handlePointerDown(e) {
            if (!e) return;
            if (e.button !== undefined && e.button !== 0) return;
            const target = e.target;
            const handle = target && target.closest ? target.closest('[data-mask-action]') : null;
            const pos = this.getNormalizedCoords(e);
            this.dragStart = { x: pos.x, y: pos.y };

            if (handle) {
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();
                this.isDragging = true;
                const action = handle.getAttribute('data-mask-action');
                this.dragMode = action;

                const mask = this.getSelectedMask();
                this.initialState = mask ? JSON.parse(JSON.stringify(mask.settings)) : null;
                this.renderSvg();
                return;
            }

            // BOŞ TUVAL ALANINA TIKLANDI:
            // Eğer bir maske zaten seçili ve aktifse, VE kullanıcı açıkça yeni maske çiz demiyorsa,
            // MEVCUT MASKEYİ ASLA BOZMA VEYA SIFIRLAMA!
            const selMask = this.getSelectedMask();
            if (selMask && selMask.active && !this.isCreatingNew) {
                return;
            }

            // Yeni maske oluşturma modu
            const currentTool = this.activeTool || this.activeMaskType || 'radial';
            if (currentTool === 'radial' || this.isCreatingNew === 'radial') {
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();
                this.isDragging = true;
                this.dragMode = 'create_radial';

                const count = this.masks.filter(m => m.type === 'radial').length + 1;
                const newMask = {
                    id: 'rad_' + Date.now(),
                    type: 'radial',
                    name: 'Radyal Maske ' + count,
                    active: true,
                    showOverlay: false,
                    settings: {
                        cx: pos.x,
                        cy: pos.y,
                        rx: 0.02,
                        ry: 0.02,
                        angle: 0,
                        feather: 0.5,
                        spread: 0.5,
                        invert: false,
                        exposure: 0,
                        temp: 0,
                        highlights: 0,
                        shadows: 0,
                        saturate: 1.0,
                        amount: 1.0
                    }
                };
                this.masks.push(newMask);
                this.selectedMaskId = newMask.id;
                this.isGuidesVisible = true;
                this.isCreatingNew = null;
                this.selectMask(newMask.id);
            } else if (currentTool === 'linear' || this.isCreatingNew === 'linear') {
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();
                this.isDragging = true;
                this.dragMode = 'create_linear';

                const count = this.masks.filter(m => m.type === 'linear').length + 1;
                const newMask = {
                    id: 'lin_' + Date.now(),
                    type: 'linear',
                    name: 'Doğrusal Gradyan ' + count,
                    active: true,
                    showOverlay: false,
                    settings: {
                        x1: pos.x,
                        y1: pos.y,
                        x2: pos.x,
                        y2: pos.y,
                        feather: 0.5,
                        spread: 0.5,
                        invert: false,
                        exposure: 0,
                        temp: 0,
                        highlights: 0,
                        shadows: 0,
                        saturate: 1.0,
                        amount: 1.0
                    }
                };
                this.masks.push(newMask);
                this.selectedMaskId = newMask.id;
                this.isGuidesVisible = true;
                this.isCreatingNew = null;
                this.selectMask(newMask.id);
            }
        }

        handlePointerMove(e) {
            if (!this.isDragging || !e) return;
            if (e.preventDefault) e.preventDefault();
            const pos = this.getNormalizedCoords(e);
            const dx = pos.x - this.dragStart.x;
            const dy = pos.y - this.dragStart.y;

            const mask = this.getSelectedMask();
            if (!mask) return;
            const s = mask.settings;

            switch (this.dragMode) {
                case 'create_radial':
                    s.rx = Math.max(0.03, Math.min(0.85, Math.abs(pos.x - s.cx)));
                    s.ry = Math.max(0.03, Math.min(0.85, Math.abs(pos.y - s.cy)));
                    break;
                case 'drag_radial_pin':
                    if (this.initialState) {
                        s.cx = Math.max(0.02, Math.min(0.98, this.initialState.cx + dx));
                        s.cy = Math.max(0.02, Math.min(0.98, this.initialState.cy + dy));
                    }
                    break;
                case 'rotate_radial': {
                    const rdx = pos.x - s.cx;
                    const rdy = pos.y - s.cy;
                    let deg = (Math.atan2(rdy, rdx) * 180 / Math.PI) + 90;
                    while (deg > 180) deg -= 360;
                    while (deg < -180) deg += 360;
                    s.angle = Math.round(deg);
                    break;
                }
                case 'drag_radial_h': {
                    const hdx = pos.x - s.cx;
                    const hdy = pos.y - s.cy;
                    const rad = -(s.angle || 0) * Math.PI / 180;
                    const localX = hdx * Math.cos(rad) - hdy * Math.sin(rad);
                    s.rx = Math.max(0.03, Math.min(0.85, Math.abs(localX)));
                    break;
                }
                case 'drag_radial_v': {
                    const vdx = pos.x - s.cx;
                    const vdy = pos.y - s.cy;
                    const rad = -(s.angle || 0) * Math.PI / 180;
                    const localY = vdx * Math.sin(rad) + vdy * Math.cos(rad);
                    s.ry = Math.max(0.03, Math.min(0.85, Math.abs(localY)));
                    break;
                }
                case 'create_linear':
                    s.x2 = pos.x;
                    s.y2 = pos.y;
                    break;
                case 'drag_linear_pin':
                    if (this.initialState) {
                        s.x1 = Math.max(0, Math.min(1, this.initialState.x1 + dx));
                        s.y1 = Math.max(0, Math.min(1, this.initialState.y1 + dy));
                        s.x2 = Math.max(0, Math.min(1, this.initialState.x2 + dx));
                        s.y2 = Math.max(0, Math.min(1, this.initialState.y2 + dy));
                    }
                    break;
                case 'drag_linear_p1':
                    s.x1 = pos.x;
                    s.y1 = pos.y;
                    break;
                case 'drag_linear_p2':
                    s.x2 = pos.x;
                    s.y2 = pos.y;
                    break;
            }

            this.syncFromSelected();
            this.renderSvg();
            this.notifyChange();
        }

        handlePointerUp() {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.dragMode = null;
            this.initialState = null;

            const mask = this.getSelectedMask();
            if (mask) {
                const s = mask.settings;
                if (mask.type === 'radial' && (s.rx < 0.04 || s.ry < 0.04)) {
                    s.rx = Math.max(0.10, s.rx);
                    s.ry = Math.max(0.10, s.ry);
                }
                if (mask.type === 'linear') {
                    const lDist = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
                    if (lDist < 0.03) {
                        s.x2 = s.x1;
                        s.y2 = Math.min(1, s.y1 + 0.35);
                    }
                }
            }

            this.syncFromSelected();
            this.renderSvg();
            this.notifyChange();
        }

        // ====================================================================
        // SVG KILAVUZ ÇİZİMİ (Anywhere-drag İç Dolgu & Çizgi, El İkonu)
        // ====================================================================
        renderSvg() {
            if (!this.svgEl) this.svgEl = document.getElementById('maskInteractiveSvg');
            if (!this.svgEl) return;

            if (!this.isGuidesVisible) {
                this.svgEl.innerHTML = '';
                return;
            }

            const mask = this.getSelectedMask();
            if (!mask || !mask.active || mask.showPin === false) {
                this.svgEl.innerHTML = '';
                return;
            }

            let html = '';

            // 1. RADYAL MASKE SVG ÇİZİMİ (Lightroom Stili)
            if (mask.type === 'radial') {
                const s = mask.settings;
                const cx = s.cx * 1000;
                const cy = s.cy * 1000;
                const rx = s.rx * 1000;
                const ry = s.ry * 1000;
                const angle = s.angle || 0;
                const spread = (s.spread !== undefined ? s.spread : 0.5);
                const fRx = rx * (1 + spread * 0.6);
                const fRy = ry * (1 + spread * 0.6);

                const pinCursor = (this.isDragging && this.dragMode === 'drag_radial_pin') ? 'grabbing' : 'grab';
                const rotCursor = (this.isDragging && this.dragMode === 'rotate_radial') ? 'grabbing' : 'grab';

                html += `<g transform="translate(${cx}, ${cy}) rotate(${angle})">`;

                // A. Seçili Alan İç Taşıma Bölgesi (Anywhere-drag)
                html += `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="rgba(56, 189, 248, 0.03)" data-mask-action="drag_radial_pin" cursor="${pinCursor}" style="cursor:${pinCursor}; pointer-events:all;" />`;

                // B. Dış Yumuşama (Feather / Spread) Kılavuz Çizgisi (İnce, zarif kesikli çizgi)
                html += `<ellipse cx="0" cy="0" rx="${fRx}" ry="${fRy}" fill="none" stroke="rgba(0, 0, 0, 0.5)" stroke-width="2" stroke-dasharray="4,4" vector-effect="non-scaling-stroke" pointer-events="none" />`;
                html += `<ellipse cx="0" cy="0" rx="${fRx}" ry="${fRy}" fill="none" stroke="rgba(255, 255, 255, 0.85)" stroke-width="1" stroke-dasharray="4,4" vector-effect="non-scaling-stroke" pointer-events="none" />`;

                // C. Ana Radyal Elips (Yüksek kontrastlı, net ve ince çizgi)
                html += `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="none" stroke="rgba(0, 0, 0, 0.65)" stroke-width="2.6" vector-effect="non-scaling-stroke" pointer-events="none" />`;
                html += `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="none" stroke="#ffffff" stroke-width="1.3" data-mask-action="drag_radial_pin" cursor="${pinCursor}" style="cursor:${pinCursor}; pointer-events:all;" vector-effect="non-scaling-stroke" />`;

                // D. Döndürme Kılavuz Kolu
                const rotStemLen = 30;
                html += `<line x1="0" y1="${-ry}" x2="0" y2="${-ry - rotStemLen}" stroke="rgba(0, 0, 0, 0.5)" stroke-width="2" vector-effect="non-scaling-stroke" pointer-events="none" />`;
                html += `<line x1="0" y1="${-ry}" x2="0" y2="${-ry - rotStemLen}" stroke="rgba(255, 255, 255, 0.85)" stroke-width="1" stroke-dasharray="3,3" vector-effect="non-scaling-stroke" pointer-events="none" />`;
                html += `
                    <g data-mask-action="rotate_radial" transform="translate(0, ${-ry - rotStemLen})" cursor="${rotCursor}" style="cursor:${rotCursor}; pointer-events:all; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
                        <circle r="14" fill="transparent" />
                        <circle r="8.5" fill="#1e293b" stroke="#ffffff" stroke-width="1.4" vector-effect="non-scaling-stroke" />
                        <path d="M-3,-3 A 4.5 4.5 0 0 1 3.8,-0.8 L 2.4,0.6 M 3.8,-0.8 L 3.8,-3 M 3,3 A 4.5 4.5 0 0 1 -3.8,0.8 L -2.4,-0.6 M -3.8,0.8 L -3.8,3" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                    </g>
                `;

                // E. 4 Kardinal Tutamaç (Doğu, Batı, Kuzey, Güney - Küçük, zarif yuvarlak kontrol noktaları)
                // East
                html += `
                    <g data-mask-action="drag_radial_h" transform="translate(${rx}, 0)" cursor="ew-resize" style="cursor:ew-resize; pointer-events:all; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.6));">
                        <circle r="14" fill="transparent" />
                        <circle r="4.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" vector-effect="non-scaling-stroke" />
                        <circle r="1.5" fill="#0284c7" />
                    </g>
                `;
                // West
                html += `
                    <g data-mask-action="drag_radial_h" transform="translate(${-rx}, 0)" cursor="ew-resize" style="cursor:ew-resize; pointer-events:all; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.6));">
                        <circle r="14" fill="transparent" />
                        <circle r="4.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" vector-effect="non-scaling-stroke" />
                        <circle r="1.5" fill="#0284c7" />
                    </g>
                `;
                // North
                html += `
                    <g data-mask-action="drag_radial_v" transform="translate(0, ${-ry})" cursor="ns-resize" style="cursor:ns-resize; pointer-events:all; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.6));">
                        <circle r="14" fill="transparent" />
                        <circle r="4.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" vector-effect="non-scaling-stroke" />
                        <circle r="1.5" fill="#0284c7" />
                    </g>
                `;
                // South
                html += `
                    <g data-mask-action="drag_radial_v" transform="translate(0, ${ry})" cursor="ns-resize" style="cursor:ns-resize; pointer-events:all; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.6));">
                        <circle r="14" fill="transparent" />
                        <circle r="4.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" vector-effect="non-scaling-stroke" />
                        <circle r="1.5" fill="#0284c7" />
                    </g>
                `;

                // F. Merkez Taşıma Pini (İkonik Hedef Rozeti)
                html += `
                    <g data-mask-action="drag_radial_pin" transform="translate(0, 0)" cursor="${pinCursor}" style="cursor:${pinCursor}; pointer-events:all; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.7));">
                        <circle r="18" fill="transparent" />
                        <circle r="11" fill="rgba(0,0,0,0.3)" />
                        <circle r="9.5" fill="#18181b" stroke="#ffffff" stroke-width="2" vector-effect="non-scaling-stroke" />
                        <circle r="5.5" fill="none" stroke="rgba(255, 255, 255, 0.4)" stroke-width="0.8" vector-effect="non-scaling-stroke" />
                        <circle r="2.8" fill="#38bdf8" />
                    </g>
                `;

                html += `</g>`;
            }

            // 2. DOĞRUSAL GRADYAN SVG ÇİZİMİ (Lightroom Stili)
            else if (mask.type === 'linear') {
                const s = mask.settings;
                const x1 = s.x1 * 1000;
                const y1 = s.y1 * 1000;
                const x2 = s.x2 * 1000;
                const y2 = s.y2 * 1000;
                const mx = (x1 + x2) * 0.5;
                const my = (y1 + y2) * 0.5;
                const pinCursor = (this.isDragging && this.dragMode === 'drag_linear_pin') ? 'grabbing' : 'grab';

                const dx = x2 - x1;
                const dy = y2 - y1;
                const len = Math.hypot(dx, dy) || 1;
                const nx = -dy / len;
                const ny = dx / len;
                const span = 1500;

                const p1_a = { x: x1 - nx * span, y: y1 - ny * span };
                const p1_b = { x: x1 + nx * span, y: y1 + ny * span };
                const pm_a = { x: mx - nx * span, y: my - ny * span };
                const pm_b = { x: mx + nx * span, y: my + ny * span };
                const p2_a = { x: x2 - nx * span, y: y2 - ny * span };
                const p2_b = { x: x2 + nx * span, y: y2 + ny * span };

                // A. P1-P2 arası Taşıma Bandı (Anywhere-drag)
                html += `<polygon points="${p1_a.x},${p1_a.y} ${p1_b.x},${p1_b.y} ${p2_b.x},${p2_b.y} ${p2_a.x},${p2_a.y}" fill="rgba(192, 132, 252, 0.04)" data-mask-action="drag_linear_pin" cursor="${pinCursor}" style="cursor:${pinCursor}; pointer-events:all;" />`;

                // 1. Çizgi: 100% Etki Sınırı (Üst kesikli çizgi)
                html += `<line x1="${p1_a.x}" y1="${p1_a.y}" x2="${p1_b.x}" y2="${p1_b.y}" stroke="rgba(0, 0, 0, 0.5)" stroke-width="2.2" stroke-dasharray="5,5" vector-effect="non-scaling-stroke" pointer-events="none" />`;
                html += `<line x1="${p1_a.x}" y1="${p1_a.y}" x2="${p1_b.x}" y2="${p1_b.y}" stroke="rgba(255, 255, 255, 0.85)" stroke-width="1.2" stroke-dasharray="5,5" vector-effect="non-scaling-stroke" pointer-events="none" />`;

                // 2. Çizgi: 50% Orta Geçiş Pivotu (Net düz beyaz çizgi)
                html += `<line x1="${pm_a.x}" y1="${pm_a.y}" x2="${pm_b.x}" y2="${pm_b.y}" stroke="rgba(0, 0, 0, 0.6)" stroke-width="3" data-mask-action="drag_linear_pin" cursor="${pinCursor}" style="cursor:${pinCursor}; pointer-events:all;" vector-effect="non-scaling-stroke" />`;
                html += `<line x1="${pm_a.x}" y1="${pm_a.y}" x2="${pm_b.x}" y2="${pm_b.y}" stroke="#ffffff" stroke-width="1.4" pointer-events="none" vector-effect="non-scaling-stroke" />`;

                // 3. Çizgi: 0% Bitiş Sınırı (Alt kesikli çizgi)
                html += `<line x1="${p2_a.x}" y1="${p2_a.y}" x2="${p2_b.x}" y2="${p2_b.y}" stroke="rgba(0, 0, 0, 0.5)" stroke-width="2.2" stroke-dasharray="5,5" vector-effect="non-scaling-stroke" pointer-events="none" />`;
                html += `<line x1="${p2_a.x}" y1="${p2_a.y}" x2="${p2_b.x}" y2="${p2_b.y}" stroke="rgba(255, 255, 255, 0.75)" stroke-width="1.2" stroke-dasharray="5,5" vector-effect="non-scaling-stroke" pointer-events="none" />`;

                // Eksen Yön Kılavuzu (P1 -> P2 bağlantı çizgisi)
                html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(0, 0, 0, 0.5)" stroke-width="2" vector-effect="non-scaling-stroke" pointer-events="none" />`;
                html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255, 255, 255, 0.85)" stroke-width="1" stroke-dasharray="3,3" vector-effect="non-scaling-stroke" pointer-events="none" />`;

                // Merkez Taşıma Pini (İkonik Hedef Rozeti)
                html += `
                    <g data-mask-action="drag_linear_pin" transform="translate(${mx}, ${my})" cursor="${pinCursor}" style="cursor:${pinCursor}; pointer-events:all; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.7));">
                        <circle r="18" fill="transparent" />
                        <circle r="11" fill="rgba(0,0,0,0.3)" />
                        <circle r="9.5" fill="#18181b" stroke="#ffffff" stroke-width="2" vector-effect="non-scaling-stroke" />
                        <circle r="5.5" fill="none" stroke="rgba(255, 255, 255, 0.4)" stroke-width="0.8" vector-effect="non-scaling-stroke" />
                        <circle r="2.8" fill="#c084fc" />
                    </g>
                `;

                // P1 Tutamacı (Zarif yuvarlak kontrol pini)
                html += `
                    <g data-mask-action="drag_linear_p1" transform="translate(${x1}, ${y1})" cursor="ns-resize" style="cursor:ns-resize; pointer-events:all; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.6));">
                        <circle r="14" fill="transparent" />
                        <circle r="4.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" vector-effect="non-scaling-stroke" />
                        <circle r="1.5" fill="#a855f7" />
                    </g>
                `;

                // P2 Tutamacı (Zarif yuvarlak kontrol pini)
                html += `
                    <g data-mask-action="drag_linear_p2" transform="translate(${x2}, ${y2})" cursor="ns-resize" style="cursor:ns-resize; pointer-events:all; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.6));">
                        <circle r="14" fill="transparent" />
                        <circle r="4.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" vector-effect="non-scaling-stroke" />
                        <circle r="1.5" fill="#7c3aed" />
                    </g>
                `;
            }

            this.svgEl.innerHTML = html;
        }

        // ====================================================================
        // DURUM YEDEKLEME VE GERİ YÜKLEME (autoSave.js UYUMLU)
        // ====================================================================
        getState() {
            return {
                masks: this.masks.map(m => ({
                    id: m.id,
                    type: m.type,
                    name: m.name,
                    active: m.active,
                    showOverlay: m.showOverlay,
                    showPin: m.showPin !== undefined ? m.showPin : true,
                    settings: { ...m.settings }
                })),
                selectedMaskId: this.selectedMaskId,
                radial: this.radial,
                linear: this.linear,
                showOverlay: this.showOverlay
            };
        }

        setState(state) {
            if (!state) return;
            if (state.masks && Array.isArray(state.masks)) {
                this.masks = state.masks.map(m => ({
                    ...m,
                    settings: { ...m.settings }
                }));
                this.selectedMaskId = state.selectedMaskId || (this.masks[0] ? this.masks[0].id : null);
            } else {
                if (state.radial) {
                    const rMask = this.masks.find(m => m.type === 'radial');
                    if (rMask) {
                        rMask.active = !!state.radial.active;
                        Object.assign(rMask.settings, state.radial);
                    }
                }
                if (state.linear) {
                    const lMask = this.masks.find(m => m.type === 'linear');
                    if (lMask) {
                        lMask.active = !!state.linear.active;
                        Object.assign(lMask.settings, state.linear);
                    }
                }
            }

            if (state.showOverlay !== undefined) this.showOverlay = !!state.showOverlay;

            this.updatePanelsVisibility();
            this.syncFromSelected();
            this.renderLayersList();
            this.renderSvg();
            this.notifyChange();
        }
    }

    const maskInstance = new PhotoMasksManager();
    window.PhotoMasksManager = maskInstance;

    if (typeof document !== 'undefined') {
        const autoInit = () => {
            if (!maskInstance.containerEl) {
                maskInstance.init();
            }
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', autoInit);
        } else {
            setTimeout(autoInit, 50);
        }
    }
})(window);
