/**
 * Görseller Sekmesi (PhotoStagingArchive) Birleşik Toplu Çıktı & Çoklu Gönderi Çıktısı Modülü
 * Normal fotoğraf veya şablonlu tasarım ayrımı olmadan seçili görselleri tek merkezden
 * dışa aktarır ve Çoklu Gönderi albüm çıktısını yönetir.
 */
(function() {
    'use strict';

    const state = {
        batchFormat: '',
        batchFormatManual: false,
        batchFileType: '',
        batchFileTypeManual: false,
        batchScale: '',
        batchScaleManual: false,
        batchJpgQuality: 95,
        batchPreset: 'current',
        batchPrefix: '',
        carouselFormat: '',
        carouselFormatManual: false,
        carouselFileType: '',
        carouselFileTypeManual: false,
        carouselScale: '',
        carouselScaleManual: false,
        carouselJpgQuality: 95
    };

    function escapeAttr(val) {
        return String(val || '').replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[m]));
    }

    function getDefaultFormat() {
        const expFmt = document.getElementById('exportFormat');
        if (expFmt && expFmt.value) return expFmt.value;
        return 'Orijinal Görsel Boyutu';
    }

    function getDefaultFileType() {
        const expType = document.getElementById('exportFileType');
        const v = expType ? expType.value : 'jpg';
        return (v === 'mp4' || v === 'video') ? 'jpg' : (v || 'jpg');
    }

    function getDefaultScale() {
        const expScale = document.getElementById('exportScale');
        return (expScale && expScale.value) ? expScale.value : '1';
    }

    function syncDefaultsFromGlobal() {
        if (!state.batchFormatManual || !state.batchFormat) state.batchFormat = getDefaultFormat();
        if (!state.batchFileTypeManual || !state.batchFileType) state.batchFileType = getDefaultFileType();
        if (!state.batchScaleManual || !state.batchScale) state.batchScale = getDefaultScale();

        if (!state.carouselFormatManual || !state.carouselFormat) state.carouselFormat = getDefaultFormat();
        if (!state.carouselFileTypeManual || !state.carouselFileType) state.carouselFileType = getDefaultFileType();
        if (!state.carouselScaleManual || !state.carouselScale) state.carouselScale = getDefaultScale();
    }

    function buildFormatOptionsHtml(selectedVal) {
        if (typeof EXPORT_FORMATS === 'undefined' || !EXPORT_FORMATS) {
            return `<option value="Orijinal Görsel Boyutu" selected>Orijinal Görsel Boyutu</option>`;
        }
        return Object.keys(EXPORT_FORMATS).map(name => {
            const f = EXPORT_FORMATS[name];
            const cleanName = name.replace(/\s*\([^)]*\)/g, '').trim();
            const label = `${cleanName} — ${f.w}x${f.h}`;
            const sel = (name === selectedVal) ? 'selected' : '';
            return `<option value="${escapeAttr(name)}" ${sel}>${escapeAttr(label)}</option>`;
        }).join('');
    }

    function renderTraysHtml(archive) {
        syncDefaultsFromGlobal();

        const isBatchOpen = !!archive.batchExportTrayOpen;
        const isCarouselOpen = !!archive.carouselTrayOpen;
        const selCount = archive.selectedIds ? archive.selectedIds.size : 0;
        const totalCount = archive.items ? archive.items.length : 0;
        const targetCount = selCount > 0 ? selCount : totalCount;

        const cm = (window.CarouselManager && !window.CarouselManager._isProxy) ? window.CarouselManager : null;
        const isCarouselActive = !!(cm && cm.isVisible);
        const pageCount = (isCarouselActive && Array.isArray(cm.pages) && cm.pages.length > 0)
            ? cm.pages.length
            : targetCount;
        const countLabel = isCarouselActive
            ? `${pageCount} Sayfa Aktif`
            : `${pageCount} Görsel Hazır`;

        const bType = state.batchFileType || 'jpg';
        const bScale = state.batchScale || '1';
        const cType = state.carouselFileType || 'jpg';
        const cScale = state.carouselScale || '1';

        return `
            <!-- 📦 BİRLEŞİK TOPLU ÇIKTI PANELİ -->
            <div class="staging-sub-tray ${isBatchOpen ? 'is-open' : ''}" id="stagingBatchExportTray">
                <div class="staging-tray-title">
                    <span class="staging-tray-title-text"><i class="fa-solid fa-boxes-stacked" style="color:#0284c7;"></i> Toplu Çıktı</span>
                    <button type="button" class="btn-action staging-tray-close-btn" onclick="PhotoStagingArchive.toggleBatchExportTray()">Kapat</button>
                </div>

                <div class="staging-tray-row" style="flex-direction:column; align-items:stretch; gap:3px;">
                    <label style="font-size:10.5px; font-weight:700; color:#475569;">BOYUT VE FORMAT</label>
                    <select class="staging-tray-select" id="batchExportFormat" style="width:100%;" onchange="StagingExportTrays.onFieldChange('batchFormat', this.value)">
                        ${buildFormatOptionsHtml(state.batchFormat)}
                    </select>
                </div>

                <div class="staging-tray-row">
                    <div style="flex:1 1 0; min-width:0; display:flex; flex-direction:column; gap:3px;">
                        <label style="font-size:10.5px; font-weight:700; color:#475569;">DOSYA TİPİ</label>
                        <select class="staging-tray-select" id="batchExportFileType" style="width:100%;" onchange="StagingExportTrays.onFieldChange('batchFileType', this.value)">
                            <option value="jpg" ${bType === 'jpg' ? 'selected' : ''}>JPG</option>
                            <option value="png" ${bType === 'png' ? 'selected' : ''}>PNG</option>
                            <option value="png_transparent" ${bType === 'png_transparent' ? 'selected' : ''}>Şeffaf PNG</option>
                        </select>
                    </div>
                    <div style="flex:1 1 0; min-width:0; display:flex; flex-direction:column; gap:3px;">
                        <label style="font-size:10.5px; font-weight:700; color:#475569;">ÇÖZÜNÜRLÜK</label>
                        <select class="staging-tray-select" id="batchExportScale" style="width:100%;" onchange="StagingExportTrays.onFieldChange('batchScale', this.value)">
                            <option value="0.5" ${bScale === '0.5' ? 'selected' : ''}>0.5x</option>
                            <option value="0.75" ${bScale === '0.75' ? 'selected' : ''}>0.75x</option>
                            <option value="1" ${bScale === '1' ? 'selected' : ''}>1x</option>
                            <option value="1.5" ${bScale === '1.5' ? 'selected' : ''}>1.5x</option>
                            <option value="2" ${bScale === '2' ? 'selected' : ''}>2x</option>
                            <option value="original" ${bScale === 'original' ? 'selected' : ''}>Orijinal</option>
                        </select>
                    </div>
                </div>

                <div class="slider-group" style="margin:0;">
                    <label style="display:flex; justify-content:space-between; margin-bottom:2px; font-size:11px; font-weight:600;">
                        <span>JPG Kalitesi</span>
                        <span id="batchJpgQualityVal">${state.batchJpgQuality}%</span>
                    </label>
                    <input type="range" id="batchJpgQualitySlider" min="60" max="100" step="1" value="${state.batchJpgQuality}" oninput="StagingExportTrays.onQualityInput('batch', this.value)">
                </div>

                <div class="staging-tray-row" style="flex-direction:column; align-items:stretch; gap:3px;">
                    <label style="font-size:10.5px; font-weight:700; color:#475569;">UYGULANACAK HAZIR AYAR</label>
                    <select class="staging-tray-select" id="batchPresetSelect" style="width:100%;" onchange="StagingExportTrays.onFieldChange('batchPreset', this.value)">
                        <option value="current">Mevcut Tuval Ayarları</option>
                    </select>
                </div>

                <div class="staging-tray-row" style="flex-direction:column; align-items:stretch; gap:3px;">
                    <label style="font-size:10.5px; font-weight:700; color:#475569;">İLAN VE DOSYA ÖN EKİ</label>
                    <input type="text" id="batchPrefixInput" value="${escapeAttr(state.batchPrefix)}" placeholder="Örn: ILAN-102-" oninput="StagingExportTrays.onFieldChange('batchPrefix', this.value)" style="width:100%; height:32px; padding:0 8px; background:var(--dark-3, #ffffff); border:1px solid #cbd5e1; color:var(--text, #0f172a); border-radius:6px; font-size:11.5px; box-sizing:border-box;">
                </div>

                <div class="staging-tray-row" style="margin-top:2px;">
                    <button type="button" class="btn-action staging-tray-btn" style="flex:1 1 0; min-width:0; height:32px; margin:0; white-space:nowrap;" onclick="StagingExportTrays.runBatchExport('folder')" title="Seçeceğiniz klasöre tüm görselleri doğrudan kaydeder">
                        <i class="fa-solid fa-folder-arrow-down" style="color:#0284c7;"></i> Klasöre Kaydet
                    </button>
                    <button type="button" id="stagingBatchDownloadBtn" class="btn-action staging-tray-btn" style="flex:1 1 0; min-width:0; height:32px; margin:0; white-space:nowrap;" onclick="StagingExportTrays.runBatchExport('zip')" title="Seçili görselleri tek bir ZIP arşivi olarak indirir">
                        <i class="fa-solid fa-file-zipper" style="color:#8b5cf6;"></i> ZIP İndir
                    </button>
                </div>

                <div class="staging-tray-row">
                    <button type="button" class="btn-action staging-tray-btn" style="flex:1 1 0; min-width:0; height:32px; margin:0; white-space:nowrap;" onclick="StagingExportTrays.runBatchExport('files')" title="Görselleri ayrı ayrı dosyalar halinde indirir">
                        <i class="fa-solid fa-bolt" style="color:#10b981;"></i> Tek Tek İndir
                    </button>
                    <button type="button" class="btn-action staging-tray-btn" style="flex:1 1 0; min-width:0; height:32px; margin:0; white-space:nowrap;" onclick="startInteractiveBatchExport()" title="Her fotoğrafı sırayla tuvalde görüp onaylayarak indirin">
                        <i class="fa-solid fa-eye" style="color:#0284c7;"></i> Adım Adım Düzenle
                    </button>
                </div>

                <div class="batch-progress" id="batchProgress" style="display:none; margin-top:4px;">
                    <div style="font-size:11px; color:#64748b; display:flex; justify-content:space-between;"><span id="batchStatus">Hazırlanıyor...</span> <span id="batchPercent">0%</span></div>
                    <div class="bar"><div class="bar-fill" id="batchBar"></div></div>
                </div>
            </div>

            <!-- 🎞️ BİRLEŞİK ÇOKLU GÖNDERİ VE ALBÜM ÇIKTISI PANELİ -->
            <div class="staging-sub-tray ${isCarouselOpen ? 'is-open' : ''}" id="stagingCarouselTray">
                <div class="staging-tray-title">
                    <span class="staging-tray-title-text"><i class="fa-solid fa-layer-group" style="color:#0284c7;"></i> Çoklu Gönderi Çıktısı</span>
                    <button type="button" class="btn-action staging-tray-close-btn" onclick="PhotoStagingArchive.toggleCarouselTray()">Kapat</button>
                </div>

                <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; padding:6px 8px; border:1px solid #cbd5e1; border-radius:6px;">
                    <div style="display:flex; align-items:center; gap:6px; flex:1 1 auto; min-width:0;">
                        <i class="fa-solid fa-images" style="color:#0284c7; flex-shrink:0;"></i>
                        <span style="font-size:11px; font-weight:700; color:var(--text, #0f172a); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" id="carouselBatchCountText">${countLabel}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:4px; flex:0 0 auto;">
                        ${isCarouselActive ? `
                            <button type="button" class="btn-action" style="width:auto; flex:0 0 auto; height:24px; padding:0 8px; font-size:10px; margin:0; white-space:nowrap;" onclick="if(window.CarouselManager) CarouselManager.syncFromStaging(false)" title="Görsel havuzundaki seçili fotoğraflarla albüm sayfalarını eşitle">
                                <i class="fa-solid fa-arrows-rotate"></i> Eşitle
                            </button>
                            <button type="button" class="btn-action staging-tray-btn-danger" style="width:auto; flex:0 0 auto; height:24px; padding:0 8px; font-size:10px; margin:0; white-space:nowrap;" onclick="StagingExportTrays.stopCarouselMode()" title="Çoklu gönderi modunu kapat">
                                Bitir
                            </button>
                        ` : `
                            <button type="button" class="btn-action" style="width:auto; flex:0 0 auto; height:24px; padding:0 8px; font-size:10px; margin:0; white-space:nowrap;" onclick="PhotoStagingArchive.exportToCarousel()" title="Seçili görselleri tuvalde sayfa sayfa gezilebilen çoklu gönderi albümüne dönüştür">
                                <i class="fa-solid fa-play" style="color:#0284c7;"></i> Albümü Başlat
                            </button>
                        `}
                    </div>
                </div>

                <div class="staging-tray-row" style="flex-direction:column; align-items:stretch; gap:3px;">
                    <label style="font-size:10.5px; font-weight:700; color:#475569;">ALBÜM BOYUTU VE FORMATI</label>
                    <select class="staging-tray-select" id="carouselExportFormat" style="width:100%;" onchange="StagingExportTrays.onFieldChange('carouselFormat', this.value)">
                        ${buildFormatOptionsHtml(state.carouselFormat)}
                    </select>
                </div>

                <div class="staging-tray-row">
                    <div style="flex:1 1 0; min-width:0; display:flex; flex-direction:column; gap:3px;">
                        <label style="font-size:10.5px; font-weight:700; color:#475569;">DOSYA TİPİ</label>
                        <select class="staging-tray-select" id="carouselExportFileType" style="width:100%;" onchange="StagingExportTrays.onFieldChange('carouselFileType', this.value)">
                            <option value="jpg" ${cType === 'jpg' ? 'selected' : ''}>JPG</option>
                            <option value="png" ${cType === 'png' ? 'selected' : ''}>PNG</option>
                            <option value="png_transparent" ${cType === 'png_transparent' ? 'selected' : ''}>Şeffaf PNG</option>
                        </select>
                    </div>
                    <div style="flex:1 1 0; min-width:0; display:flex; flex-direction:column; gap:3px;">
                        <label style="font-size:10.5px; font-weight:700; color:#475569;">ÇÖZÜNÜRLÜK</label>
                        <select class="staging-tray-select" id="carouselExportScale" style="width:100%;" onchange="StagingExportTrays.onFieldChange('carouselScale', this.value)">
                            <option value="0.5" ${cScale === '0.5' ? 'selected' : ''}>0.5x</option>
                            <option value="0.75" ${cScale === '0.75' ? 'selected' : ''}>0.75x</option>
                            <option value="1" ${cScale === '1' ? 'selected' : ''}>1x</option>
                            <option value="1.5" ${cScale === '1.5' ? 'selected' : ''}>1.5x</option>
                            <option value="2" ${cScale === '2' ? 'selected' : ''}>2x</option>
                            <option value="original" ${cScale === 'original' ? 'selected' : ''}>Orijinal</option>
                        </select>
                    </div>
                </div>

                <div class="slider-group" style="margin:0;">
                    <label style="display:flex; justify-content:space-between; margin-bottom:2px; font-size:11px; font-weight:600;">
                        <span>JPG Kalitesi</span>
                        <span id="carouselJpgQualityVal">${state.carouselJpgQuality}%</span>
                    </label>
                    <input type="range" id="carouselJpgQualitySlider" min="60" max="100" step="1" value="${state.carouselJpgQuality}" oninput="StagingExportTrays.onQualityInput('carousel', this.value)">
                </div>

                <div class="staging-tray-row" style="margin-top:2px;">
                    <button type="button" class="btn-action staging-tray-btn" style="width:100%; height:32px; margin:0; white-space:nowrap;" onclick="StagingExportTrays.runCarouselExport('folder')" title="Bilgisayarınızda bir klasör seçin, tüm albüm sayfaları doğrudan o klasöre kaydedilsin">
                        <i class="fa-solid fa-folder-arrow-down" style="color:#0284c7;"></i> Klasöre Kaydet
                    </button>
                </div>

                <div class="staging-tray-row">
                    <button type="button" class="btn-action staging-tray-btn" style="flex:1 1 0; min-width:0; height:32px; margin:0; white-space:nowrap;" onclick="StagingExportTrays.runCarouselExport('zip')" title="Tüm albüm sayfalarını tek bir ZIP arşivi içinde indirin">
                        <i class="fa-solid fa-file-zipper" style="color:#8b5cf6;"></i> ZIP İndir
                    </button>
                    <button type="button" class="btn-action staging-tray-btn" style="flex:1 1 0; min-width:0; height:32px; margin:0; white-space:nowrap;" onclick="StagingExportTrays.runCarouselExport('individual')" title="Tüm albüm sayfalarını ayrı ayrı görsel dosyaları olarak indirin">
                        <i class="fa-solid fa-images" style="color:#10b981;"></i> Tek Tek İndir
                    </button>
                </div>
            </div>
        `;
    }

    function hydrateAfterRender() {
        if (window.CustomPresetsManager && typeof window.CustomPresetsManager.renderBatchSelectUI === 'function') {
            window.CustomPresetsManager.renderBatchSelectUI();
            const presetSel = document.getElementById('batchPresetSelect');
            if (presetSel && state.batchPreset && presetSel.querySelector(`option[value="${state.batchPreset}"]`)) {
                presetSel.value = state.batchPreset;
            }
        }
        ['batchExportFormat', 'batchExportFileType', 'batchExportScale', 'carouselExportFormat', 'carouselExportFileType', 'carouselExportScale'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const isManual = (
                (id === 'batchExportFormat' && state.batchFormatManual) ||
                (id === 'batchExportFileType' && state.batchFileTypeManual) ||
                (id === 'batchExportScale' && state.batchScaleManual) ||
                (id === 'carouselExportFormat' && state.carouselFormatManual) ||
                (id === 'carouselExportFileType' && state.carouselFileTypeManual) ||
                (id === 'carouselExportScale' && state.carouselScaleManual)
            );
            if (isManual) el.dataset.manualOverride = 'true';
        });
    }

    window.StagingExportTrays = {
        state,
        renderTraysHtml,
        hydrateAfterRender,
        syncFromGlobal: function(force) {
            if (force) {
                state.batchFormatManual = false;
                state.batchFileTypeManual = false;
                state.batchScaleManual = false;
                state.carouselFormatManual = false;
                state.carouselFileTypeManual = false;
                state.carouselScaleManual = false;
            }
            syncDefaultsFromGlobal();
        },
        onFieldChange: function(key, val) {
            state[key] = val;
            if (key === 'batchFormat') state.batchFormatManual = true;
            if (key === 'batchFileType') {
                state.batchFileTypeManual = true;
                if (window.PhotoStagingArchive) {
                    window.PhotoStagingArchive.exportQuality = (val === 'png' || val === 'png_transparent') ? 'lossless' : 'ultra';
                }
            }
            if (key === 'batchScale') state.batchScaleManual = true;
            if (key === 'carouselFormat') state.carouselFormatManual = true;
            if (key === 'carouselFileType') state.carouselFileTypeManual = true;
            if (key === 'carouselScale') state.carouselScaleManual = true;
        },
        onQualityInput: function(target, val) {
            const q = Math.min(100, Math.max(60, parseInt(val, 10) || 95));
            if (target === 'carousel') {
                state.carouselJpgQuality = q;
                const lbl = document.getElementById('carouselJpgQualityVal');
                if (lbl) lbl.textContent = q + '%';
            } else {
                state.batchJpgQuality = q;
                const lbl = document.getElementById('batchJpgQualityVal');
                if (lbl) lbl.textContent = q + '%';
            }
        },
        runBatchExport: function(deliveryMode) {
            if (typeof window.startBatchExport === 'function') {
                return window.startBatchExport({ mode: deliveryMode });
            }
        },
        runCarouselExport: async function(deliveryMode) {
            const archive = window.PhotoStagingArchive;
            if ((!window.CarouselManager || window.CarouselManager._isProxy) && window.LazyLoader) {
                await window.LazyLoader.load('carousel', { label: 'Karusel Yöneticisi' });
            }
            const cm = window.CarouselManager;
            if (!cm) return;
            if ((!cm.isVisible || !Array.isArray(cm.pages) || cm.pages.length === 0) && archive && archive.items && archive.items.length > 0) {
                await archive.exportToCarousel();
            } else if (typeof cm.syncFromStaging === 'function') {
                cm.syncFromStaging(true);
            }
            return cm.exportAllPages(deliveryMode);
        },
        stopCarouselMode: function() {
            const cm = window.CarouselManager;
            if (cm && cm.isVisible) {
                if (typeof cm.toggleBar === 'function') cm.toggleBar(false);
                cm.isVisible = false;
                const badge = document.getElementById('canvasCarouselBadge');
                if (badge) badge.style.display = 'none';
                if (window.PhotoStagingArchive) window.PhotoStagingArchive.renderPanel();
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Çoklu gönderi modu kapatıldı.', 'info');
                }
            }
        }
    };
})();
