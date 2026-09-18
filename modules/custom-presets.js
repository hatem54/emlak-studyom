/**
 * ====================================================================
 * EmlakStüdyom - Özel Fotoğraf Hazır Ayarları (Custom Presets) Modülü
 * modules/custom-presets.js
 * ====================================================================
 */

(function(window) {
    'use strict';

    const STORAGE_KEY = 'emlak_custom_photo_presets';

    const HSL_COLORS = ['red', 'orange', 'yellow', 'green', 'aqua', 'blue', 'purple', 'magenta'];

    const FILTER_INPUT_IDS = [
        'exposure', 'contrast', 'saturate', 'fblur', 'sepia', 'hueRotate',
        'grayscale', 'invertCtrl', 'vignette', 'shadowsCtrl', 'highlightsCtrl',
        'blacksCtrl', 'whitesCtrl', 'tempCtrl', 'tintCtrl', 'vibranceCtrl',
        'sharpnessCtrl', 'clarityCtrl', 'dehazeCtrl'
    ];

    const KEYSTONE_INPUT_IDS = [
        'keystoneV', 'keystoneH', 'keystoneRotate', 'keystoneAspect', 'keystoneZoom'
    ];

    const CustomPresetsManager = {
        /**
         * localStorage'dan kullanıcının kayıtlı hazır ayarlarını yükler
         */
        getAllPresets() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                console.error('Hazır ayarlar okunamadı:', e);
                return [];
            }
        },

        /**
         * Hazır ayarlar listesini localStorage'a yazar
         */
        savePresetsList(presets) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
                this.renderUI();
            } catch (e) {
                console.error('Hazır ayarlar kaydedilemedi:', e);
            }
        },

        /**
         * Tuvaldeki mevcut tüm filtre, HSL ve eğri değerlerini yakalar
         */
        captureCurrentState(presetName) {
            const filters = {};
            FILTER_INPUT_IDS.forEach(id => {
                const el = document.getElementById(id);
                if (el) filters[id] = parseFloat(el.value) || 0;
            });

            const geometry = {};
            KEYSTONE_INPUT_IDS.forEach(id => {
                const el = document.getElementById(id);
                if (el) geometry[id] = parseFloat(el.value) || 0;
            });

            const hsl = {};
            HSL_COLORS.forEach(color => {
                hsl[color] = {
                    h: 0, s: 0, l: 0
                };
                ['h', 's', 'l'].forEach(type => {
                    const slider = document.querySelector(`.hsl-slider[data-color="${color}"][data-type="${type}"]`);
                    if (slider) {
                        hsl[color][type] = parseFloat(slider.value) || 0;
                    }
                });
            });

            let curves = null;
            if (window.PhotoCurvesManager && typeof window.PhotoCurvesManager.getState === 'function') {
                curves = window.PhotoCurvesManager.getState();
            }

            return {
                id: 'preset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                name: (presetName || 'Özel Ayar').trim(),
                createdAt: Date.now(),
                filters,
                geometry,
                hsl,
                curves
            };
        },

        /**
         * Kullanıcıya isim sorarak mevcut ayarları kaydeder
         */
        async promptSaveCurrent() {
            let presetName = '';

            if (typeof Swal !== 'undefined') {
                const { value: name, isConfirmed } = await Swal.fire({
                    title: '💾 Hazır Ayar Olarak Kaydet',
                    text: 'Mevcut fotoğraf filtreleri ve renk ayarlarınız için bir isim belirleyin:',
                    input: 'text',
                    inputPlaceholder: 'Örn: Aydınlık Salon, Gece Villa, Sıcak Mutfak...',
                    inputAttributes: {
                        maxlength: 30,
                        autocapitalize: 'words',
                        autocorrect: 'off'
                    },
                    background: '#1e293b',
                    color: '#fff',
                    showCancelButton: true,
                    confirmButtonText: 'Kaydet',
                    cancelButtonText: 'Vazgeç',
                    confirmButtonColor: '#3b82f6',
                    cancelButtonColor: '#64748b',
                    inputValidator: (value) => {
                        if (!value || !value.trim()) {
                            return 'Lütfen geçerli bir hazır ayar adı girin!';
                        }
                    }
                });

                if (!isConfirmed || !name) return;
                presetName = name.trim();
            } else {
                const res = prompt('Hazır ayarınız için bir isim girin:', 'Benim Ayarım');
                if (!res || !res.trim()) return;
                presetName = res.trim();
            }

            const newPreset = this.captureCurrentState(presetName);
            const presets = this.getAllPresets();
            presets.unshift(newPreset); // En yeni başa
            this.savePresetsList(presets);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `"${presetName}" kaydedildi!`,
                    showConfirmButton: false,
                    timer: 2000,
                    background: '#1e293b',
                    color: '#fff'
                });
            }
        },

        /**
         * Belirtilen ID'ye sahip hazır ayarı siler
         */
        async deletePreset(id) {
            const presets = this.getAllPresets();
            const target = presets.find(p => p.id === id);
            if (!target) return;

            if (typeof Swal !== 'undefined') {
                const res = await Swal.fire({
                    title: 'Hazır Ayarı Sil?',
                    html: `<b>"${target.name}"</b> hazır ayarını silmek istediğinize emin misiniz?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Evet, Sil',
                    cancelButtonText: 'Vazgeç',
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#64748b',
                    background: '#1e293b',
                    color: '#fff'
                });
                if (!res.isConfirmed) return;
            } else {
                if (!confirm(`"${target.name}" hazır ayarını silmek istiyor musunuz?`)) return;
            }

            const updated = presets.filter(p => p.id !== id);
            this.savePresetsList(updated);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'info',
                    title: 'Hazır ayar silindi',
                    showConfirmButton: false,
                    timer: 1800,
                    background: '#1e293b',
                    color: '#fff'
                });
            }
        },

        /**
         * Seçilen hazır ayarı tuvale ve arayüze uygular
         */
        applyPreset(presetOrId) {
            let preset = null;
            if (typeof presetOrId === 'string') {
                const presets = this.getAllPresets();
                preset = presets.find(p => p.id === presetOrId);

                // Eğer custom preset değilse yerleşik PRESETS kontrolü yap
                if (!preset && window.PRESETS && window.PRESETS[presetOrId]) {
                    if (typeof window.applyPreset === 'function') {
                        window.applyPreset(presetOrId);
                    }
                    return;
                }
            } else if (presetOrId && typeof presetOrId === 'object') {
                preset = presetOrId;
            }

            if (!preset) return;

            // 1. Önce standart filtreleri varsayılana çek veya preset değerini yaz
            if (window.FILTER_DEFAULTS) {
                Object.keys(window.FILTER_DEFAULTS).forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = window.FILTER_DEFAULTS[id];
                });
            }

            if (preset.filters) {
                Object.keys(preset.filters).forEach(k => {
                    const el = document.getElementById(k);
                    if (el) el.value = preset.filters[k];
                });
            }

            // 2. Keystone / Geometri (varsa)
            if (preset.geometry) {
                Object.keys(preset.geometry).forEach(k => {
                    const el = document.getElementById(k);
                    if (el) el.value = preset.geometry[k];
                });
            }

            // 3. HSL Ayarları
            HSL_COLORS.forEach(color => {
                ['h', 's', 'l'].forEach(type => {
                    const slider = document.querySelector(`.hsl-slider[data-color="${color}"][data-type="${type}"]`);
                    const valSpan = document.getElementById(`hsl_${type}_${color}Val`);
                    let val = 0;
                    if (preset.hsl && preset.hsl[color] && preset.hsl[color][type] !== undefined) {
                        val = preset.hsl[color][type];
                    }
                    if (slider) slider.value = val;
                    if (valSpan) valSpan.textContent = val;
                });
            });

            // 4. Ton Eğrileri (Curves)
            if (preset.curves && window.PhotoCurvesManager && typeof window.PhotoCurvesManager.setState === 'function') {
                window.PhotoCurvesManager.setState(preset.curves);
            }

            // 5. Motorları tetikle
            if (typeof window.applyPhotoFilters === 'function') {
                window.applyPhotoFilters();
            }
            if (typeof window.processHSL === 'function') {
                window.processHSL();
            }
            if (typeof window.processPixels === 'function') {
                window.processPixels(true);
            }
            if (typeof window.requestPhotoRepaint === 'function') {
                window.requestPhotoRepaint();
            }

            // Toast bildirimi
            if (typeof Swal !== 'undefined' && preset.name) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `"${preset.name}" uygulandı`,
                    showConfirmButton: false,
                    timer: 1500,
                    background: '#1e293b',
                    color: '#fff'
                });
            }
        },

        /**
         * Fotoğraf sekmesindeki ve Çıktı sekmesindeki UI bileşenlerini yeniden çizer
         */
        renderUI() {
            this.renderPhotoTabUI();
            this.renderBatchSelectUI();
        },

        /**
         * Fotoğraf sekmesindeki "Özel Hazır Ayarlarım" alanını çizer
         */
        renderPhotoTabUI() {
            const container = document.getElementById('userPresetsContainer');
            if (!container) return;

            const presets = this.getAllPresets();
            if (!presets.length) {
                container.innerHTML = `
                    <div style="font-size: 11px; color: #94a3b8; text-align: center; padding: 10px 6px; background: rgba(15, 23, 42, 0.5); border-radius: 6px; border: 1px dashed #334155;">
                        Henüz kayıtlı hazır ayarınız yok.<br>Filtreleri ayarlayıp <b>"Hazır Ayar Kaydet"</b> butonuna basabilirsiniz.
                    </div>
                `;
                return;
            }

            let html = `
                <div style="font-size: 11px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
                    <span>📁 Özel Hazır Ayarlarım (${presets.length})</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto; padding-right: 2px;">
            `;

            presets.forEach(p => {
                const dateStr = new Date(p.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
                html += `
                    <div style="display: flex; align-items: center; justify-content: space-between; background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 6px 10px; transition: background 0.15s;" class="custom-preset-row">
                        <div style="display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1; overflow: hidden;" onclick="CustomPresetsManager.applyPreset('${p.id}')">
                            <span style="font-size: 13px;">🎨</span>
                            <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                <div style="font-size: 12px; font-weight: 600; color: #f8fafc;">${escapeHtml(p.name)}</div>
                                <div style="font-size: 10px; color: #94a3b8;">${dateStr}</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 4px; align-items: center;">
                            <button title="Uygula" onclick="CustomPresetsManager.applyPreset('${p.id}')" style="background: #3b82f6; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer;">
                                Uygula
                            </button>
                            <button title="Sil" onclick="CustomPresetsManager.deletePreset('${p.id}')" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px; padding: 4px 6px; font-size: 11px; cursor: pointer;">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            container.innerHTML = html;
        },

        /**
         * Çıktı sekmesindeki "🎨 Uygulanacak Hazır Ayar" dropdown'unu günceller
         */
        renderBatchSelectUI() {
            const select = document.getElementById('batchPresetSelect');
            if (!select) return;

            const currentVal = select.value;
            const presets = this.getAllPresets();

            let optionsHtml = `
                <option value="current">Mevcut Tuval Ayarları</option>
                <optgroup label="--- Yerleşik Önayarlar ---">
                    <option value="original">🔄 Orijinal</option>
                    <option value="bright">☀️ Aydınlık</option>
                    <option value="dark">🌙 Karanlık</option>
                    <option value="vivid">🎨 Canlı</option>
                    <option value="warm">🔥 Sıcak</option>
                    <option value="cool">❄️ Soğuk</option>
                    <option value="indoor">🏠 İç Mekan</option>
                    <option value="outdoor">🌳 Dış Mekan</option>
                    <option value="luxury">💎 Lüks</option>
                </optgroup>
            `;

            if (presets.length > 0) {
                optionsHtml += `<optgroup label="--- Özel Hazır Ayarlarınız ---">`;
                presets.forEach(p => {
                    optionsHtml += `<option value="${p.id}">⭐ ${escapeHtml(p.name)}</option>`;
                });
                optionsHtml += `</optgroup>`;
            }

            select.innerHTML = optionsHtml;
            if (currentVal && select.querySelector(`option[value="${currentVal}"]`)) {
                select.value = currentVal;
            }
        },

        init() {
            this.renderUI();
        }
    };

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    window.CustomPresetsManager = CustomPresetsManager;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CustomPresetsManager.init());
    } else {
        setTimeout(() => CustomPresetsManager.init(), 100);
    }

})(window);
