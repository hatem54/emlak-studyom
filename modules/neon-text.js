/**
 * ================================================================
 * ⚡ EMLAK STÜDYOM - NEON METİN VE TİPOGRAFİ EFEKTLERİ MODÜLÜ
 * modules/neon-text.js
 * ================================================================
 */

(function() {
    'use strict';

    // Canlı Neon Animasyonu (Varsayılan olarak kapalıdır, CPU/GPU yükü oluşturmaz)
    window.isNeonTextAnimActive = false;

    /**
     * 1. Tuvale Yeni Neon Yazı Ekle
     */
    function addNeonText(preset = 'fully-lit', glowColor = '#00f0ff', initialText = 'NEON YAZI') {
        const el = document.createElement('div');
        el.className = 'draggable canvas-el neon-text-el';
        el.textContent = initialText;
        el.dataset.rawText = initialText;
        el.dataset.label = 'Neon Yazı';
        el.dataset.rotation = '0';
        el.dataset.shadowVal = '0';
        el.dataset.blurVal = '0';
        el.dataset.storedBgHex = '#000000';
        el.dataset.storedBgOpacity = '0';
        el.dataset.storedBorderColor = '#000000';
        el.dataset.storedBorderWidth = '0';
        el.dataset.saberActive = 'true';
        el.dataset.neonPreset = preset;
        el.id = 'neon_text_' + Date.now();

        const cContainer = document.getElementById('canvas-container');
        const cW = (cContainer && parseFloat(cContainer.style.width)) || (cContainer && cContainer.offsetWidth) || (typeof uploadedImgW !== 'undefined' && uploadedImgW > 0 ? uploadedImgW : 1920);
        const cH = (cContainer && parseFloat(cContainer.style.height)) || (cContainer && cContainer.offsetHeight) || (typeof uploadedImgH !== 'undefined' && uploadedImgH > 0 ? uploadedImgH : 1080);
        
        const hasImg = (typeof hasImageOnCanvas === 'function') ? hasImageOnCanvas() : false;
        const baseFontSize = hasImg ? Math.max(72, Math.min(140, Math.round(cW * 0.045))) : Math.max(48, Math.min(90, Math.round(cW * 0.035)));
        
        el.dataset.defaultFont = baseFontSize.toString();
        el.style.fontSize = baseFontSize + 'px';
        el.style.padding = '10px 16px';
        el.style.background = 'transparent';
        el.style.border = 'none';
        el.style.color = 'transparent'; // PixiJS Saber parlayan çekirdek ve haleyi render eder
        const existingLayers = Array.from(document.querySelectorAll('#canvas-container .canvas-el, #canvas-container .draggable, #three-d-layer, #saber-layer'));
        let maxZ = 50;
        existingLayers.forEach(l => {
            const z = parseInt(l.style.zIndex || (window.getComputedStyle ? window.getComputedStyle(l).zIndex : 0), 10) || 0;
            if (z > maxZ && z < 9000) maxZ = z;
        });
        const newZ = maxZ + 5;
        el.dataset.layerZIndex = String(newZ);
        el.style.setProperty('z-index', String(newZ), 'important');
        const saberLayer = document.getElementById('saber-layer');
        if (saberLayer) {
            const saberZ = Math.max(1, newZ - 1);
            saberLayer.dataset.layerZIndex = String(saberZ);
            saberLayer.style.setProperty('z-index', String(saberZ), 'important');
        }
        el.style.fontFamily = "'Archivo Black', sans-serif";
        el.style.fontWeight = '900';
        el.style.letterSpacing = '1px';

        const estW = Math.round(baseFontSize * 7.5);
        const estH = Math.round(baseFontSize * 1.3);
        const posX = Math.max(20, Math.round((cW - estW) / 2));
        const posY = Math.max(20, Math.round((cH - estH) / 2));
        el.style.left = posX + 'px';
        el.style.top = posY + 'px';

        const targetLayer = (typeof uiLayer !== 'undefined' && uiLayer) ? uiLayer : (document.getElementById('ui-layer') || cContainer);
        if (targetLayer) targetLayer.appendChild(el);

        if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
            window.CanvasEmptyState.dismiss();
        } else {
            const es = document.getElementById('canvasEmptyState');
            if (es) { es.classList.add('is-hidden'); es.style.display = 'none'; }
        }

        if (typeof window.renderLayers === 'function') window.renderLayers();
        if (typeof bindDrag === 'function') bindDrag(el);
        if (typeof enableInlineEdit === 'function') enableInlineEdit(el);
        if (typeof window.addTextHandles === 'function') window.addTextHandles(el);
        if (typeof isCanvaMode !== 'undefined' && isCanvaMode && typeof canvaOverlays !== 'undefined') canvaOverlays.push(el);

        // Saber Engine Parametreleri
        const isFullNeon = (preset === 'full-neon');
        const opts = {
            preset: preset,
            glowColor: glowColor,
            coreColor: isFullNeon ? glowColor : '#ffffff',
            coreSize: 0,
            glowSize: 35,
            intensity: 3.0,
            flickerAmount: (preset === 'electric' ? 0.15 : (preset === 'fire' ? 0.2 : 0.02))
        };
        el.dataset.saberOpts = JSON.stringify(opts);

        if (window.SaberEngine && typeof window.SaberEngine.addTextSaber === 'function') {
            window.SaberEngine.addTextSaber(el.id, el, opts);
            window.SaberEngine.updateTextSaberPositions();
        }

        if (typeof selectElement === 'function') {
            selectElement(el, false, true, false);
        } else if (typeof window.selectElement === 'function') {
            window.selectElement(el, false, true, false);
        }
        const elSettings = document.getElementById('elSettings');
        if (elSettings) elSettings.style.display = 'none';

        // UI Preset Butonunu Güncelle
        selectNeonPreset(preset, el, false);

        if (typeof window.recordHistory === 'function') window.recordHistory('Neon Yazı eklendi');
        if (typeof window.requestAutoSave === 'function') window.requestAutoSave();

        return el;
    }

    /**
     * 2. Mevcut 2D Metinde Neonu Aç / Kapat
     */
    function toggleTextNeon(targetEl) {
        const el = targetEl || (typeof selectedEl !== 'undefined' ? selectedEl : null);
        if (!el) return;

        // 3D kontrolü: 3D nesne veya 3D modu ise neon uygulanmaz
        if (window.ThreeDEngine && typeof window.ThreeDEngine.isActive === 'function' && window.ThreeDEngine.isActive()) return;
        if (el.classList.contains('three-d-layer') || el.closest('#threeDContainer')) return;

        const isNeonOn = el.dataset.saberActive === 'true';
        if (isNeonOn) {
            // Neonu Kapat
            el.dataset.saberActive = 'false';
            el.style.color = el.dataset.storedTextColor || '#ffffff';
            el.style.textShadow = el.dataset.storedTextShadow || '';
            el.style.webkitTextStroke = '';
            if (window.SaberEngine && typeof window.SaberEngine.removeTextSaber === 'function') {
                window.SaberEngine.removeTextSaber(el.id || el.dataset.saberElId);
                const app = window.SaberEngine.getApp();
                if (app && app.renderer && app.stage) {
                    try { app.renderer.render(app.stage); } catch(e) {}
                }
            }
            if (document.getElementById('elTextSaber')) {
                document.getElementById('elTextSaber').checked = false;
            }
            updateNeonUIStatus(false);
        } else {
            // Neonu Aç
            el.dataset.saberActive = 'true';
            if (!el.id) el.id = 'neon_text_' + Date.now();
            if (el.style.color && el.style.color !== 'transparent') {
                el.dataset.storedTextColor = el.style.color;
            }
            if (el.style.textShadow && el.style.textShadow !== 'none') {
                el.dataset.storedTextShadow = el.style.textShadow;
            }
            el.style.color = 'transparent';
            el.style.textShadow = 'none';
            el.style.webkitTextStroke = 'none';

            const preset = el.dataset.neonPreset || 'fully-lit';
            const colorInput = document.getElementById('neonTextGlowColor');
            const glowCol = colorInput ? colorInput.value : '#00f0ff';
            const isFullNeon = (preset === 'full-neon');

            const opts = {
                preset: preset,
                glowColor: glowCol,
                coreColor: isFullNeon ? glowCol : '#ffffff',
                coreSize: 0,
                glowSize: 35,
                intensity: 3.0,
                flickerAmount: (preset === 'electric' ? 0.15 : (preset === 'fire' ? 0.2 : 0.02))
            };
            el.dataset.saberOpts = JSON.stringify(opts);

            if (window.SaberEngine && typeof window.SaberEngine.addTextSaber === 'function') {
                window.SaberEngine.addTextSaber(el.id, el, opts);
                window.SaberEngine.updateTextSaberPositions();
            }

            if (document.getElementById('elTextSaber')) {
                document.getElementById('elTextSaber').checked = true;
            }

            if (typeof switchTab === 'function') {
                switchTab('font');
            }
            updateNeonUIStatus(true, preset);
        }
    }

    /**
     * 3. Hazır Neon Efekti Presetini Seç (Saf Neon, Tam Neon, Alev, Dönme, Elektrik, Kıvılcım, Gökkuşağı)
     */
    function selectNeonPreset(presetKey, targetEl, applyToEl = true) {
        const el = targetEl || (typeof selectedEl !== 'undefined' ? selectedEl : null) || document.querySelector('#canvas-container .canvas-el.selected, #canvas-container .canvas-el[data-saber-active="true"], #canvas-container .neon-text-el');

        // UI Butonunu aktif yap
        const grid = document.getElementById('tabFontNeonPresets');
        if (grid) {
            grid.querySelectorAll('.btn-action').forEach(b => {
                if (b.dataset.preset === presetKey) {
                    b.classList.add('active');
                } else {
                    b.classList.remove('active');
                }
            });
        }

        if (!el || !applyToEl) return;

        // Metinde neon kapalıysa aç
        if (el.dataset.saberActive !== 'true') {
            el.dataset.saberActive = 'true';
            if (!el.id) el.id = 'neon_text_' + Date.now();
            if (el.style.color && el.style.color !== 'transparent') {
                el.dataset.storedTextColor = el.style.color;
            }
            if (el.style.textShadow && el.style.textShadow !== 'none') {
                el.dataset.storedTextShadow = el.style.textShadow;
            }
            el.style.color = 'transparent';
            el.style.textShadow = 'none';
            el.style.webkitTextStroke = 'none';
        }

        el.dataset.neonPreset = presetKey;

        const glowColInput = document.getElementById('neonTextGlowColor');
        const coreColInput = document.getElementById('neonTextCoreColor');
        const intInput = document.getElementById('neonTextIntensity');
        const glowSizeInput = document.getElementById('neonTextGlowSize');

        let curGlow = glowColInput ? glowColInput.value : '#00f0ff';
        let curCore = coreColInput ? coreColInput.value : '#ffffff';
        let curInt = intInput ? parseFloat(intInput.value) : 3.0;
        let curSize = glowSizeInput ? parseFloat(glowSizeInput.value) : 35;

        // Preset'e özel parametre uyarlaması
        if (presetKey === 'fully-lit') {
            curCore = '#ffffff';
            curInt = 3.0;
            curSize = 35;
        } else if (presetKey === 'full-neon') {
            curCore = curGlow;
            curInt = 3.2;
            curSize = 35;
        } else if (presetKey === 'fire') {
            curGlow = '#ff4400';
            curCore = '#ffee88';
            curInt = 3.5;
            curSize = 42;
        } else if (presetKey === 'electric') {
            curGlow = '#00aaff';
            curCore = '#ffffff';
            curInt = 3.2;
            curSize = 30;
        } else if (presetKey === 'vortex') {
            curGlow = '#a855f7';
            curCore = '#ffffff';
            curInt = 3.2;
            curSize = 38;
        } else if (presetKey === 'sparks') {
            curGlow = '#f59e0b';
            curCore = '#fffbeb';
            curInt = 3.0;
            curSize = 32;
        } else if (presetKey === 'rainbow') {
            curInt = 3.0;
            curSize = 36;
        }

        if (glowColInput) glowColInput.value = curGlow;
        if (coreColInput) coreColInput.value = curCore;
        if (intInput) {
            intInput.value = curInt;
            const valEl = document.getElementById('neonTextIntensityVal');
            if (valEl) valEl.textContent = curInt;
        }
        if (glowSizeInput) {
            glowSizeInput.value = curSize;
            const valEl = document.getElementById('neonTextGlowSizeVal');
            if (valEl) valEl.textContent = curSize;
        }

        const opts = {
            preset: presetKey,
            glowColor: curGlow,
            coreColor: curCore,
            coreSize: 0,
            glowSize: curSize,
            intensity: curInt,
            flickerAmount: (presetKey === 'electric' ? 0.15 : (presetKey === 'fire' ? 0.2 : 0.02))
        };
        el.dataset.saberOpts = JSON.stringify(opts);

        if (window.SaberEngine && typeof window.SaberEngine.addTextSaber === 'function') {
            window.SaberEngine.addTextSaber(el.id, el, opts);
            window.SaberEngine.updateTextSaberPositions();

            const app = window.SaberEngine.getApp();
            if (app) {
                const isAnimatedPreset = ['fire', 'vortex', 'electric', 'sparks', 'rainbow'].includes(presetKey);
                const shouldAnimate = isAnimatedPreset && (window.isNeonTextAnimActive === true);
                if (shouldAnimate) {
                    if (app.ticker && !app.ticker.started) app.ticker.start();
                } else {
                    if (typeof window.isSaberAnimationActive === 'function' && !window.isSaberAnimationActive()) {
                        if (app.ticker && app.ticker.started) app.ticker.stop();
                    }
                    if (app.renderer && app.stage) {
                        try { app.renderer.render(app.stage); } catch(e) {}
                    }
                }
            }
        }
    }

    /**
     * 4. Neon Parametrelerini Canlı Güncelle (Parlama Şiddeti, Hale, Renkler)
     */
    function updateNeonTextParams() {
        const el = (typeof selectedEl !== 'undefined' ? selectedEl : null);
        if (!el || el.dataset.saberActive !== 'true') return;

        const glowColInput = document.getElementById('neonTextGlowColor');
        const coreColInput = document.getElementById('neonTextCoreColor');
        const intInput = document.getElementById('neonTextIntensity');
        const glowSizeInput = document.getElementById('neonTextGlowSize');

        let glowCol = glowColInput ? glowColInput.value : '#00f0ff';
        let coreCol = coreColInput ? coreColInput.value : '#ffffff';
        const isFullNeon = (el.dataset.neonPreset === 'full-neon');
        if (isFullNeon) {
            coreCol = glowCol;
            if (coreColInput) coreColInput.value = glowCol;
        }

        const intensity = intInput ? parseFloat(intInput.value) : 3.0;
        const glowSize = glowSizeInput ? parseFloat(glowSizeInput.value) : 35;

        const intValEl = document.getElementById('neonTextIntensityVal');
        if (intValEl) intValEl.textContent = intensity;
        const glowValEl = document.getElementById('neonTextGlowSizeVal');
        if (glowValEl) glowValEl.textContent = glowSize;

        const opts = {
            preset: el.dataset.neonPreset || 'fully-lit',
            glowColor: glowCol,
            coreColor: coreCol,
            coreSize: 0,
            glowSize: glowSize,
            intensity: intensity
        };
        el.dataset.saberOpts = JSON.stringify(opts);

        if (window.SaberEngine && typeof window.SaberEngine.addTextSaber === 'function') {
            window.SaberEngine.addTextSaber(el.id || el.dataset.saberElId, el, opts);
            window.SaberEngine.updateTextSaberPositions();
            const app = window.SaberEngine.getApp();
            if (app && app.renderer && app.stage && (!app.ticker || !app.ticker.started)) {
                try { app.renderer.render(app.stage); } catch(e) {}
            }
        }
    }

    /**
     * 5. Alternatif Tipografi Stilleri (Lüks Altın, Metalik Krom, Çift Kontur, Cyberpunk, 3D Gölge)
     */
    function applyTypographyStyle(styleKey, targetEl) {
        const el = targetEl || (typeof selectedEl !== 'undefined' ? selectedEl : null);
        if (!el) return;

        // UI Butonunu aktif yap
        const grid = document.getElementById('tabFontTypoPresets');
        if (grid) {
            grid.querySelectorAll('.btn-action').forEach(b => {
                if (b.dataset.style === styleKey) {
                    b.classList.add('active');
                } else {
                    b.classList.remove('active');
                }
            });
        }

        // Önceki tipografi stillerini temizle
        el.classList.remove('typo-gold', 'typo-chrome', 'typo-sticker', 'typo-cyberpunk', 'typo-shadow3d');

        if (styleKey === 'clean') {
            // Efekti Sıfırla
            if (el.dataset.saberActive === 'true') {
                toggleTextNeon(el);
            }
            el.style.textShadow = 'none';
            el.style.webkitTextStroke = '0px transparent';
            el.style.color = el.dataset.storedTextColor || '#ffffff';
            el.style.background = 'transparent';
            if (typeof updateDrawHistory === 'function') updateDrawHistory();
            return;
        }

        // CSS tabanlı tipografi stilleri için Saber neonunu kapat (çakışmayı önle)
        if (el.dataset.saberActive === 'true') {
            el.dataset.saberActive = 'false';
            if (window.SaberEngine && typeof window.SaberEngine.removeTextSaber === 'function') {
                window.SaberEngine.removeTextSaber(el.id || el.dataset.saberElId);
                const app = window.SaberEngine.getApp();
                if (app && app.renderer && app.stage) {
                    try { app.renderer.render(app.stage); } catch(e) {}
                }
            }
        }

        el.classList.add('typo-' + styleKey);
        el.dataset.typographyStyle = styleKey;

        if (styleKey === 'gold') {
            el.style.color = '#fffbeb';
            el.style.fontFamily = "'Montserrat', sans-serif";
            el.style.fontWeight = '800';
            el.style.textShadow = '0 0 12px rgba(251,191,36,0.95), 0 2px 5px rgba(180,83,9,0.9), 0 0 26px rgba(245,158,11,0.6)';
        } else if (styleKey === 'chrome') {
            el.style.color = '#f8fafc';
            el.style.fontFamily = "'Space Grotesk', sans-serif";
            el.style.fontWeight = '700';
            el.style.textShadow = '0 1px 0 #cbd5e1, 0 2px 0 #94a3b8, 0 3px 0 #64748b, 0 5px 12px rgba(0,0,0,0.85)';
        } else if (styleKey === 'sticker') {
            el.style.color = '#fef08a';
            el.style.fontFamily = "'Archivo Black', sans-serif";
            el.style.fontWeight = '900';
            el.style.textShadow = '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 5px 12px rgba(0,0,0,0.85)';
        } else if (styleKey === 'cyberpunk') {
            el.style.color = '#ff2a85';
            el.style.fontFamily = "'Space Grotesk', sans-serif";
            el.style.fontWeight = '800';
            el.style.textShadow = '0 0 8px #ff2a85, 0 0 16px #ff2a85, 0 0 28px #00f0ff, 0 0 42px #00f0ff';
        } else if (styleKey === 'shadow3d') {
            el.style.color = '#ffffff';
            el.style.fontFamily = "'Archivo Black', sans-serif";
            el.style.fontWeight = '900';
            el.style.textShadow = '1px 1px 0 #0f172a, 2px 2px 0 #0f172a, 3px 3px 0 #0f172a, 4px 4px 0 #0f172a, 5px 5px 0 #0f172a, 6px 6px 14px rgba(0,0,0,0.75)';
        }

        if (typeof updateDrawHistory === 'function') updateDrawHistory();
    }

    /**
     * 6. UI Senkronizasyonu
     */
    function updateNeonUIStatus(isActive, preset = 'fully-lit') {
        const grid = document.getElementById('tabFontNeonPresets');
        if (grid) {
            grid.querySelectorAll('.btn-action').forEach(b => {
                if (isActive && b.dataset.preset === preset) {
                    b.classList.add('active');
                } else if (!isActive) {
                    b.classList.remove('active');
                }
            });
        }
    }

    function syncNeonTextUI(el) {
        if (!el || !el.classList || !el.classList.contains('canvas-el')) return;

        if (el.dataset.saberActive === 'true') {
            const preset = el.dataset.neonPreset || 'fully-lit';
            updateNeonUIStatus(true, preset);
            if (el.dataset.saberOpts) {
                try {
                    const opts = JSON.parse(el.dataset.saberOpts);
                    const intIn = document.getElementById('neonTextIntensity');
                    const glowSizeIn = document.getElementById('neonTextGlowSize');
                    const glowColIn = document.getElementById('neonTextGlowColor');
                    const coreColIn = document.getElementById('neonTextCoreColor');

                    if (intIn && opts.intensity) { intIn.value = opts.intensity; const val = document.getElementById('neonTextIntensityVal'); if (val) val.textContent = opts.intensity; }
                    if (glowSizeIn && opts.glowSize) { glowSizeIn.value = opts.glowSize; const val = document.getElementById('neonTextGlowSizeVal'); if (val) val.textContent = opts.glowSize; }
                    if (glowColIn && opts.glowColor) { glowColIn.value = (typeof opts.glowColor === 'number' ? '#' + opts.glowColor.toString(16).padStart(6, '0') : opts.glowColor); }
                    if (coreColIn && opts.coreColor) { coreColIn.value = (typeof opts.coreColor === 'number' ? '#' + opts.coreColor.toString(16).padStart(6, '0') : opts.coreColor); }
                } catch(e) {}
            }
        } else {
            updateNeonUIStatus(false);
        }

        if (el.dataset.typographyStyle) {
            const typoGrid = document.getElementById('tabFontTypoPresets');
            if (typoGrid) {
                typoGrid.querySelectorAll('.btn-action').forEach(b => {
                    if (b.dataset.style === el.dataset.typographyStyle) {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                });
            }
        }

        // Animasyon butonunu senkronize et
        const animBtn = document.getElementById('neonTextAnimBtn');
        if (animBtn) {
            if (window.isNeonTextAnimActive) {
                animBtn.classList.add('active');
                animBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Canlı Animasyon';
            } else {
                animBtn.classList.remove('active');
                animBtn.innerHTML = '<i class="fa-solid fa-play"></i> Canlı Animasyon';
            }
        }
    }

    /**
     * 7. Canlı Neon Animasyonunu Aç / Kapat
     */
    function toggleNeonTextAnimation(forceState) {
        window.isNeonTextAnimActive = (forceState !== undefined) ? !!forceState : !window.isNeonTextAnimActive;
        
        const animBtn = document.getElementById('neonTextAnimBtn');
        if (animBtn) {
            if (window.isNeonTextAnimActive) {
                animBtn.classList.add('active');
                animBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Canlı Animasyon';
            } else {
                animBtn.classList.remove('active');
                animBtn.innerHTML = '<i class="fa-solid fa-play"></i> Canlı Animasyon';
            }
        }

        if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
            const app = window.SaberEngine.getApp();
            if (app) {
                if (window.isNeonTextAnimActive) {
                    if (app.ticker && !app.ticker.started) app.ticker.start();
                } else {
                    if (typeof window.isSaberAnimationActive === 'function' && !window.isSaberAnimationActive()) {
                        if (app.ticker && app.ticker.started) app.ticker.stop();
                    }
                    if (app.renderer && app.stage) {
                        try { app.renderer.render(app.stage); } catch(e) {}
                    }
                }
            }
        }
    }

    /**
     * 8. Neon Metin Görünümünü ve Konumunu Tazele
     * (Font değişikliği, kalınlık slider'ı ve boyut güncellemelerinde DOM/PixiJS senkronizasyonu sağlar)
     */
    function refreshNeonText(targetEl) {
        const el = targetEl || (typeof selectedEl !== 'undefined' ? selectedEl : null) || document.querySelector('#canvas-container .canvas-el.selected, #canvas-container .canvas-el[data-saber-active="true"], #canvas-container .neon-text-el');
        if (!el || el.dataset.saberActive !== 'true') return;

        el.style.color = 'transparent';
        el.style.textShadow = 'none';
        el.style.webkitTextStroke = 'none';

        if (window.SaberEngine && typeof window.SaberEngine.updateTextSaberPositions === 'function') {
            window.SaberEngine.updateTextSaberPositions();
            const app = window.SaberEngine.getApp ? window.SaberEngine.getApp() : null;
            if (app && app.renderer && app.stage && (!app.ticker || !app.ticker.started)) {
                try { app.renderer.render(app.stage); } catch(e) {}
            }
        }
    }

    // Seçim değiştiğinde otomatik senkronize et
    if (window.EmlakState && typeof window.EmlakState.addEventListener === 'function') {
        window.EmlakState.addEventListener('selectionChanged', (e) => {
            const { newEl } = e.detail || {};
            if (newEl) syncNeonTextUI(newEl);
        });
    }

    // Global Dışa Aktarımlar
    window.addNeonText = addNeonText;
    window.toggleTextNeon = toggleTextNeon;
    window.selectNeonPreset = selectNeonPreset;
    window.updateNeonTextParams = updateNeonTextParams;
    window.applyTypographyStyle = applyTypographyStyle;
    window.syncNeonTextUI = syncNeonTextUI;
    window.toggleNeonTextAnimation = toggleNeonTextAnimation;
    window.refreshNeonText = refreshNeonText;

})();
