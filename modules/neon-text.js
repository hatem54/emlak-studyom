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

    function colorToRgba(col, alpha) {
        if (!col || typeof col !== 'string') return `rgba(0, 240, 255, ${alpha})`;
        col = col.trim();
        if (col.startsWith('rgb')) {
            const m = col.match(/\d+/g);
            if (m && m.length >= 3) {
                return `rgba(${m[0]}, ${m[1]}, ${m[2]}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
            }
        }
        let c = col.replace('#', '').trim();
        if (c.length === 3) c = c.split('').map(x => x + x).join('');
        if (c.length !== 6) return `rgba(0, 240, 255, ${alpha})`;
        const num = parseInt(c, 16);
        if (isNaN(num)) return `rgba(0, 240, 255, ${alpha})`;
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
    }

    /**
     * Kademeli ve Organik Neon Parlama Hesaplayıcısı (0-80 arası doğrusal ve pürüzsüz sönümleme)
     */
    function applyNeonBoxAndTextGlow(el, boxGlow, textGlow, glowCol, coreCol) {
        if (!el) return;
        const isDetailsContainer = (el.id === 'elDetails' || el.dataset?.layerUid === 'ui_details' || (el.classList && el.classList.contains('sh-box')) || !!(el.querySelector && el.querySelector('#infoLineText')));
        if (!isDetailsContainer) return;

        glowCol = glowCol || el.style.getPropertyValue('--neon-box-glow') || el.style.borderColor || '#00f0ff';
        if (!glowCol.startsWith('#') && !glowCol.startsWith('rgb')) glowCol = '#00f0ff';

        coreCol = coreCol || el.dataset.neonCoreColor || el.style.getPropertyValue('--neon-core-color') || (document.getElementById('neonTextCoreColor') ? document.getElementById('neonTextCoreColor').value : '#ffffff') || '#ffffff';
        if (!coreCol.startsWith('#') && !coreCol.startsWith('rgb')) coreCol = '#ffffff';

        boxGlow = parseInt(boxGlow !== undefined ? boxGlow : (el.dataset.neonBoxGlow !== undefined ? el.dataset.neonBoxGlow : 0));
        textGlow = parseInt(textGlow !== undefined ? textGlow : (el.dataset.neonTextGlow !== undefined ? el.dataset.neonTextGlow : 0));

        el.dataset.neonBoxGlow = boxGlow;
        el.dataset.neonTextGlow = textGlow;
        el.dataset.neonCoreColor = coreCol;
        el.dataset.saberActive = (boxGlow > 0 || textGlow > 0) ? 'true' : 'false';
        el.style.setProperty('--neon-box-glow', glowCol);
        el.style.setProperty('--neon-core-color', coreCol);

        const comp = window.getComputedStyle(el);
        if (!el.dataset.storedBorder) el.dataset.storedBorder = el.style.border || comp.border || '';
        if (!el.dataset.storedBorderColor) el.dataset.storedBorderColor = el.style.borderColor || comp.borderColor || '';
        if (!el.dataset.storedBoxShadow) el.dataset.storedBoxShadow = el.style.boxShadow || comp.boxShadow || '';
        if (!el.dataset.storedBackground) el.dataset.storedBackground = el.style.background || comp.background || '';
        if (!el.dataset.storedTextColor && el.style.color && el.style.color !== 'transparent') {
            el.dataset.storedTextColor = el.style.color;
        }

        const tplDetails = (typeof activeLayout !== 'undefined' && typeof TPL !== 'undefined' && TPL[activeLayout]) ? TPL[activeLayout].details : null;
        const origColor = el.dataset.storedTextColor || (tplDetails ? (tplDetails.color || '#e2e8f0') : '#e2e8f0');

        // 1. Çerçeve Neon Kontrolü (0-80 arası kademeli, yumuşak sönümleme)
        if (boxGlow > 0) {
            el.classList.add('neon-box-active');
            el.dataset.neonFrame = 'true';

            // Kademeli parlaklık katsayısı: 1'de 0.03'ten başlar, 30'da 1.0'e ulaşır
            const bFactor = Math.min(1, Math.max(0.03, boxGlow / 30));
            const bWidth = boxGlow <= 3 ? 1 : (boxGlow <= 12 ? 1.5 : (boxGlow <= 24 ? 2 : 3));
            const bBorderAlpha = Math.min(1, 0.15 + bFactor * 0.85);
            const bBorderColor = colorToRgba(glowCol, bBorderAlpha);

            const bShadow1Blur = boxGlow;
            const bShadow1Alpha = Math.min(1, 0.12 + bFactor * 0.88);

            const bShadow2Blur = (boxGlow * 1.7).toFixed(1);
            const bShadow2Alpha = Math.min(0.85, (0.06 + bFactor * 0.79) * 0.8);

            const bShadow3Blur = (boxGlow * 2.8).toFixed(1);
            const bShadow3Alpha = Math.min(0.5, (0.02 + bFactor * 0.48) * 0.45);

            const bInsetBlur = Math.min(20, Math.max(0.3, boxGlow * 0.55)).toFixed(1);
            const bInsetAlpha = Math.min(0.28, bFactor * 0.28);

            const boxBorderVal = `${bWidth}px solid ${bBorderColor}`;
            const boxShadowVal = `0 0 ${bShadow1Blur}px ${colorToRgba(glowCol, bShadow1Alpha)}, 0 0 ${bShadow2Blur}px ${colorToRgba(glowCol, bShadow2Alpha)}, 0 0 ${bShadow3Blur}px ${colorToRgba(glowCol, bShadow3Alpha)}, inset 0 0 ${bInsetBlur}px ${colorToRgba(glowCol, bInsetAlpha)}`;

            el.style.setProperty('--neon-box-glow-size', boxGlow + 'px');
            el.style.setProperty('--neon-box-border', boxBorderVal);
            el.style.setProperty('--neon-box-shadow', boxShadowVal);
            el.style.setProperty('border', boxBorderVal, 'important');
            el.style.borderColor = bBorderColor;
            el.style.setProperty('box-shadow', boxShadowVal, 'important');
        } else {
            el.classList.remove('neon-box-active');
            el.dataset.neonFrame = 'false';
            el.style.removeProperty('--neon-box-glow-size');
            el.style.removeProperty('--neon-box-border');
            el.style.removeProperty('--neon-box-shadow');
            el.style.removeProperty('box-shadow');
            el.style.removeProperty('border');
            el.style.removeProperty('border-color');
            el.style.border = el.dataset.storedBorder || (tplDetails ? (tplDetails.border || '') : '');
            el.style.borderColor = el.dataset.storedBorderColor || '';
            el.style.boxShadow = el.dataset.storedBoxShadow || (tplDetails ? (tplDetails.boxShadow || '') : '');
            el.style.background = el.dataset.storedBackground || (tplDetails ? (tplDetails.bg || '') : '');
        }

        // 2. Metin & İkon Neon Kontrolü (0-80 arası kademeli, yumuşak sönümleme)
        const infoText = el.querySelector('#infoLineText');
        if (infoText) {
            if (textGlow > 0) {
                el.classList.add('neon-text-active');
                el.dataset.neonText = 'true';

                // Kademeli metin katsayısı: 1'de 0.04, 25'te 1.0
                const tFactor = Math.min(1, Math.max(0.04, textGlow / 25));

                const coreBlur = Math.min(4, Math.max(0.2, textGlow * 0.15)).toFixed(1);
                const coreAlpha = Math.min(1, 0.05 + tFactor * 0.95);

                const haloBlur = Math.min(12, Math.max(0.6, textGlow * 0.42)).toFixed(1);
                const haloAlpha = Math.min(1, 0.10 + tFactor * 0.90);

                const glowBlur1 = textGlow;
                const glowAlpha1 = Math.min(0.95, 0.08 + tFactor * 0.87);

                const glowBlur2 = (textGlow * 1.5).toFixed(1);
                const glowAlpha2 = Math.min(0.65, 0.03 + tFactor * 0.62);

                const textShadowVal = `0 0 ${coreBlur}px ${colorToRgba(coreCol, coreAlpha)}, 0 0 ${haloBlur}px ${colorToRgba(glowCol, haloAlpha)}, 0 0 ${glowBlur1}px ${colorToRgba(glowCol, glowAlpha1)}, 0 0 ${glowBlur2}px ${colorToRgba(glowCol, glowAlpha2)}`;

                const iconBlur = Math.min(3, Math.max(0.2, textGlow * 0.09)).toFixed(1);
                const iconAlpha = Math.min(0.9, 0.06 + tFactor * 0.84);
                const iconFilterVal = `drop-shadow(0 0 ${iconBlur}px ${colorToRgba(glowCol, iconAlpha)})`;
                const iconOpacityVal = (0.75 + tFactor * 0.20).toFixed(2);

                // Düşük değerlerde (1-5) metin rengini doğrudan çekirdek rengi yapmayıp orijinal renkten çekirdek rengine yumuşak geçiş sağla
                const textColorVal = textGlow < 6 ? origColor : coreCol;

                el.style.setProperty('--neon-text-glow-size', textGlow + 'px');
                el.style.setProperty('--neon-text-shadow', textShadowVal);
                el.style.setProperty('--neon-text-color', textColorVal);
                el.style.setProperty('--neon-core-color', coreCol);
                el.style.setProperty('--neon-icon-filter', iconFilterVal);
                el.style.setProperty('--neon-icon-opacity', iconOpacityVal);
                el.style.setProperty('--neon-icon-color', glowCol);

                el.style.setProperty('color', textColorVal, 'important');
                infoText.style.setProperty('color', textColorVal, 'important');
                infoText.style.setProperty('text-shadow', textShadowVal, 'important');

                infoText.querySelectorAll('i, svg').forEach(ic => {
                    ic.style.setProperty('color', glowCol, 'important');
                    ic.style.setProperty('opacity', iconOpacityVal, 'important');
                    ic.style.setProperty('filter', iconFilterVal, 'important');
                });
            } else {
                el.classList.remove('neon-text-active');
                el.dataset.neonText = 'false';
                el.style.removeProperty('--neon-text-glow-size');
                el.style.removeProperty('--neon-text-shadow');
                el.style.removeProperty('--neon-text-color');
                el.style.removeProperty('--neon-core-color');
                el.style.removeProperty('--neon-icon-filter');
                el.style.removeProperty('--neon-icon-opacity');
                el.style.removeProperty('--neon-icon-color');

                el.style.color = origColor;
                infoText.style.color = origColor;
                infoText.style.textShadow = '';
                infoText.querySelectorAll('i, svg').forEach(ic => {
                    ic.style.color = '';
                    ic.style.opacity = '';
                    ic.style.filter = '';
                });
            }
        }

        // PixiJS Saber temizliği
        if (window.SaberEngine && typeof window.SaberEngine.removeTextSaber === 'function') {
            window.SaberEngine.removeTextSaber(el.id || 'elDetails');
            const app = window.SaberEngine.getApp ? window.SaberEngine.getApp() : null;
            if (app && app.renderer && app.stage) {
                try { app.renderer.render(app.stage); } catch(e) {}
            }
        }
    }
    window.applyNeonBoxAndTextGlow = applyNeonBoxAndTextGlow;

    /**
     * 2. Mevcut 2D Metinde Neonu Aç / Kapat
     */
    function toggleTextNeon(targetEl) {
        const el = targetEl || (typeof selectedEl !== 'undefined' ? selectedEl : null);
        if (!el) return;

        // 3D kontrolü: 3D nesne veya 3D modu ise neon uygulanmaz
        if (window.ThreeDEngine && typeof window.ThreeDEngine.isActive === 'function' && window.ThreeDEngine.isActive()) return;
        if (el.classList.contains('three-d-layer') || el.closest('#threeDContainer')) return;

        const isDetailsContainer = (el.id === 'elDetails' || el.dataset?.layerUid === 'ui_details' || (el.classList && el.classList.contains('sh-box')) || !!(el.querySelector && el.querySelector('#infoLineText')));
        const isNeonOn = el.dataset.saberActive === 'true' || el.classList.contains('neon-box-active') || el.classList.contains('neon-text-active');
        if (isNeonOn) {
            // Neonu Kapat
            el.dataset.saberActive = 'false';
            if (window.SaberEngine && typeof window.SaberEngine.removeTextSaber === 'function') {
                window.SaberEngine.removeTextSaber(el.id || el.dataset.saberElId || 'elDetails');
                const app = window.SaberEngine.getApp();
                if (app && app.renderer && app.stage) {
                    try { app.renderer.render(app.stage); } catch(e) {}
                }
            }

            if (isDetailsContainer) {
                el.dataset.neonBoxGlow = 0;
                el.dataset.neonTextGlow = 0;
                el.dataset.neonFrame = 'false';
                el.dataset.neonText = 'false';

                const bgIn = document.getElementById('neonBoxGlow');
                if (bgIn) { bgIn.value = 0; const v = document.getElementById('neonBoxGlowVal'); if (v) v.textContent = 'Kapalı'; }
                const tgIn = document.getElementById('neonTextGlowSize');
                if (tgIn) { tgIn.value = 0; const v = document.getElementById('neonTextGlowSizeVal'); if (v) v.textContent = 'Kapalı'; }
                const sbgIn = document.getElementById('textSaberBoxGlow');
                if (sbgIn) { sbgIn.value = 0; const v = document.getElementById('textSaberBoxGlowVal'); if (v) v.textContent = 'Kapalı'; }
                const stgIn = document.getElementById('textSaberGlowSize');
                if (stgIn) { stgIn.value = 0; const v = document.getElementById('textSaberGlowSizeVal'); if (v) v.textContent = 'Kapalı'; }

                applyNeonBoxAndTextGlow(el, 0, 0);

                delete el.dataset.storedBorder;
                delete el.dataset.storedBorderColor;
                delete el.dataset.storedBoxShadow;
                delete el.dataset.storedBackground;
                delete el.dataset.storedTextColor;
                delete el.dataset.storedTextShadow;
            } else {
                el.classList.remove('neon-box-active', 'neon-text-active');
                el.style.color = el.dataset.storedTextColor || '#ffffff';
                el.style.textShadow = el.dataset.storedTextShadow || '';
                el.style.webkitTextStroke = '';
            }

            if (document.getElementById('elTextSaber')) {
                document.getElementById('elTextSaber').checked = false;
            }
            updateNeonUIStatus(false);
        } else {
            // Neonu Aç
            el.dataset.saberActive = 'true';
            if (!el.id) el.id = 'neon_text_' + Date.now();

            const preset = el.dataset.neonPreset || 'fully-lit';
            const colorInput = document.getElementById('neonTextGlowColor');
            const glowCol = colorInput ? colorInput.value : '#00f0ff';
            const coreColorInput = document.getElementById('neonTextCoreColor');
            const coreCol = coreColorInput ? coreColorInput.value : '#ffffff';
            const isFullNeon = (preset === 'full-neon');

            if (isDetailsContainer) {
                // Kompozit Detay Çerçevesi: Çerçeve ve yazı bağımsız bayrakları
                el.dataset.neonBoxGlow = 35;
                el.dataset.neonTextGlow = 35;
                el.dataset.neonCoreColor = coreCol;
                el.dataset.neonFrame = 'true';
                el.dataset.neonText = 'true';

                const boxGroup = document.getElementById('groupNeonBoxGlow');
                if (boxGroup) boxGroup.style.display = 'block';
                const saberBoxRow = document.getElementById('saberBoxGlowRow');
                if (saberBoxRow) saberBoxRow.style.display = 'flex';
                const labelTextGlow = document.getElementById('labelNeonTextGlow');
                if (labelTextGlow) labelTextGlow.textContent = 'Yazı Parlaması';

                const bgIn = document.getElementById('neonBoxGlow');
                if (bgIn) { bgIn.value = 35; const v = document.getElementById('neonBoxGlowVal'); if (v) v.textContent = '35'; }
                const tgIn = document.getElementById('neonTextGlowSize');
                if (tgIn) { tgIn.value = 35; const v = document.getElementById('neonTextGlowSizeVal'); if (v) v.textContent = '35'; }
                const sbgIn = document.getElementById('textSaberBoxGlow');
                if (sbgIn) { sbgIn.value = 35; const v = document.getElementById('textSaberBoxGlowVal'); if (v) v.textContent = '35'; }
                const stgIn = document.getElementById('textSaberGlowSize');
                if (stgIn) { stgIn.value = 35; const v = document.getElementById('textSaberGlowSizeVal'); if (v) v.textContent = '35'; }

                applyNeonBoxAndTextGlow(el, 35, 35, glowCol, coreCol);
            } else {
                if (el.style.color && el.style.color !== 'transparent') {
                    el.dataset.storedTextColor = el.style.color;
                }
                if (el.style.textShadow && el.style.textShadow !== 'none') {
                    el.dataset.storedTextShadow = el.style.textShadow;
                }
                el.style.color = 'transparent';
                el.style.textShadow = 'none';
                el.style.webkitTextStroke = 'none';

                const opts = {
                    preset: preset,
                    glowColor: glowCol,
                    coreColor: isFullNeon ? glowCol : coreCol,
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
            }

            if (document.getElementById('elTextSaber')) {
                document.getElementById('elTextSaber').checked = true;
            }

            if (typeof switchTab === 'function') {
                switchTab('font');
                const noSelMsg = document.getElementById('noSelMsg');
                if (noSelMsg) noSelMsg.style.display = 'none';
                if (typeof loadElSettings === 'function') loadElSettings(el);
                const neonPanel = document.getElementById('neonTextControlPanel');
                if (neonPanel) {
                    setTimeout(() => neonPanel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                }
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

        const isDetailsContainer = (el.id === 'elDetails' || el.dataset?.layerUid === 'ui_details' || (el.classList && el.classList.contains('sh-box')) || !!(el.querySelector && el.querySelector('#infoLineText')));

        // Metinde neon kapalıysa aç
        if (el.dataset.saberActive !== 'true') {
            el.dataset.saberActive = 'true';
            if (!el.id) el.id = 'neon_text_' + Date.now();
            if (!isDetailsContainer) {
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

        if (isDetailsContainer) {
            el.dataset.saberActive = 'true';
            el.dataset.neonFrame = 'true';
            el.dataset.neonText = 'true';
            el.dataset.neonBoxGlow = curSize;
            el.dataset.neonTextGlow = curSize;

            const bgIn = document.getElementById('neonBoxGlow');
            if (bgIn) { bgIn.value = curSize; const v = document.getElementById('neonBoxGlowVal'); if (v) v.textContent = curSize; }
            const tgIn = document.getElementById('neonTextGlowSize');
            if (tgIn) { tgIn.value = curSize; const v = document.getElementById('neonTextGlowSizeVal'); if (v) v.textContent = curSize; }
            const sbgIn = document.getElementById('textSaberBoxGlow');
            if (sbgIn) { sbgIn.value = curSize; const v = document.getElementById('textSaberBoxGlowVal'); if (v) v.textContent = curSize; }
            const stgIn = document.getElementById('textSaberGlowSize');
            if (stgIn) { stgIn.value = curSize; const v = document.getElementById('textSaberGlowSizeVal'); if (v) v.textContent = curSize; }

            applyNeonBoxAndTextGlow(el, curSize, curSize, curGlow, curCore);
            return;
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
        if (!el) return;

        const isDetailsContainer = (el.id === 'elDetails' || el.dataset?.layerUid === 'ui_details' || (el.classList && el.classList.contains('sh-box')) || !!(el.querySelector && el.querySelector('#infoLineText')));

        const glowColInput = document.getElementById('neonTextGlowColor');
        const coreColInput = document.getElementById('neonTextCoreColor');
        const intInput = document.getElementById('neonTextIntensity');
        const glowSizeInput = document.getElementById('neonTextGlowSize');
        const boxGlowInput = document.getElementById('neonBoxGlow');

        let glowCol = glowColInput ? glowColInput.value : '#00f0ff';
        let coreCol = coreColInput ? coreColInput.value : '#ffffff';
        const isFullNeon = (el.dataset.neonPreset === 'full-neon');
        if (isFullNeon) {
            coreCol = glowCol;
            if (coreColInput) coreColInput.value = glowCol;
        }

        const intensity = intInput ? parseFloat(intInput.value) : 3.0;
        const textGlow = glowSizeInput ? parseInt(glowSizeInput.value) : 35;
        const boxGlow = boxGlowInput ? parseInt(boxGlowInput.value) : (el.dataset.neonBoxGlow !== undefined ? parseInt(el.dataset.neonBoxGlow) : 35);

        const intValEl = document.getElementById('neonTextIntensityVal');
        if (intValEl) intValEl.textContent = intensity;
        const glowValEl = document.getElementById('neonTextGlowSizeVal');
        if (glowValEl) glowValEl.textContent = (textGlow === 0 ? 'Kapalı' : textGlow);
        const boxValEl = document.getElementById('neonBoxGlowVal');
        if (boxValEl) boxValEl.textContent = (boxGlow === 0 ? 'Kapalı' : boxGlow);

        if (isDetailsContainer) {
            // Eleman Ayarları (#elSettings) alanındaki sliderları senkronize et
            const sBoxIn = document.getElementById('textSaberBoxGlow');
            if (sBoxIn) {
                sBoxIn.value = boxGlow;
                const sbv = document.getElementById('textSaberBoxGlowVal');
                if (sbv) sbv.textContent = (boxGlow === 0 ? 'Kapalı' : boxGlow);
            }
            const sTextIn = document.getElementById('textSaberGlowSize');
            if (sTextIn) {
                sTextIn.value = textGlow;
                const stv = document.getElementById('textSaberGlowSizeVal');
                if (stv) stv.textContent = (textGlow === 0 ? 'Kapalı' : textGlow);
            }
            const sColIn = document.getElementById('textSaberCustomGlow');
            if (sColIn && glowCol.startsWith('#')) sColIn.value = glowCol;
            const sCoreIn = document.getElementById('textSaberCustomCore');
            if (sCoreIn && coreCol.startsWith('#')) sCoreIn.value = coreCol;

            applyNeonBoxAndTextGlow(el, boxGlow, textGlow, glowCol, coreCol);
            return;
        }

        const opts = {
            preset: el.dataset.neonPreset || 'fully-lit',
            glowColor: glowCol,
            coreColor: coreCol,
            coreSize: 0,
            glowSize: textGlow,
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

        const btn = document.getElementById('btnToggleElNeon');
        const btnText = document.getElementById('btnToggleElNeonText');
        if (btn) {
            if (isActive) {
                btn.classList.add('active');
                if (btnText) btnText.textContent = 'Neon Açık';
            } else {
                btn.classList.remove('active');
                if (btnText) btnText.textContent = 'Neon Kapalı';
            }
        }
        const chk = document.getElementById('elTextSaber');
        if (chk) chk.checked = !!isActive;
    }

    function syncNeonTextUI(el) {
        if (!el || !el.classList || !el.classList.contains('canvas-el')) return;

        const isDetailsContainer = (el.id === 'elDetails' || el.dataset?.layerUid === 'ui_details' || (el.classList && el.classList.contains('sh-box')) || !!(el.querySelector && el.querySelector('#infoLineText')));

        const boxGroup = document.getElementById('groupNeonBoxGlow');
        const saberBoxRow = document.getElementById('saberBoxGlowRow');
        const labelTextGlow = document.getElementById('labelNeonTextGlow');
        const intensityGroup = document.getElementById('groupNeonIntensity');

        if (isDetailsContainer) {
            if (boxGroup) boxGroup.style.display = 'block';
            if (saberBoxRow) saberBoxRow.style.display = 'flex';
            if (labelTextGlow) labelTextGlow.textContent = 'Yazı Parlaması';
            if (intensityGroup) intensityGroup.style.display = 'none';

            const isNeonOn = el.dataset.saberActive === 'true' || el.classList.contains('neon-box-active') || el.classList.contains('neon-text-active');
            const boxGlow = el.dataset.neonBoxGlow !== undefined ? parseInt(el.dataset.neonBoxGlow) : (el.classList.contains('neon-box-active') ? 35 : (isNeonOn ? 35 : 0));
            const textGlow = el.dataset.neonTextGlow !== undefined ? parseInt(el.dataset.neonTextGlow) : (el.classList.contains('neon-text-active') ? 35 : (isNeonOn ? 35 : 0));

            const bgIn = document.getElementById('neonBoxGlow');
            if (bgIn) {
                bgIn.value = boxGlow;
                const v = document.getElementById('neonBoxGlowVal');
                if (v) v.textContent = (boxGlow === 0 ? 'Kapalı' : boxGlow);
            }
            const sbgIn = document.getElementById('textSaberBoxGlow');
            if (sbgIn) {
                sbgIn.value = boxGlow;
                const sv = document.getElementById('textSaberBoxGlowVal');
                if (sv) sv.textContent = (boxGlow === 0 ? 'Kapalı' : boxGlow);
            }

            const tgIn = document.getElementById('neonTextGlowSize');
            if (tgIn) {
                tgIn.value = textGlow;
                const v = document.getElementById('neonTextGlowSizeVal');
                if (v) v.textContent = (textGlow === 0 ? 'Kapalı' : textGlow);
            }
            const stgIn = document.getElementById('textSaberGlowSize');
            if (stgIn) {
                stgIn.value = textGlow;
                const sv = document.getElementById('textSaberGlowSizeVal');
                if (sv) sv.textContent = (textGlow === 0 ? 'Kapalı' : textGlow);
            }

            const glowCol = el.style.getPropertyValue('--neon-box-glow') || el.style.borderColor || '#00f0ff';
            const colIn = document.getElementById('neonTextGlowColor');
            if (colIn && glowCol.startsWith('#')) colIn.value = glowCol;
            const sColIn = document.getElementById('textSaberCustomGlow');
            if (sColIn && glowCol.startsWith('#')) sColIn.value = glowCol;

            const coreCol = el.dataset.neonCoreColor || el.style.getPropertyValue('--neon-core-color') || '#ffffff';
            const coreIn = document.getElementById('neonTextCoreColor');
            if (coreIn && coreCol.startsWith('#')) coreIn.value = coreCol;
            const sCoreIn = document.getElementById('textSaberCustomCore');
            if (sCoreIn && coreCol.startsWith('#')) sCoreIn.value = coreCol;

            const typoSec = document.getElementById('sectionTypoPresets');
            if (typoSec) typoSec.style.display = 'none';
            const advDetails = document.getElementById('detailsAdvancedTextSettings');
            if (advDetails) advDetails.open = false;

            const preset = el.dataset.neonPreset || 'fully-lit';
            updateNeonUIStatus(isNeonOn, preset);
        } else {
            const typoSec = document.getElementById('sectionTypoPresets');
            if (typoSec) typoSec.style.display = 'block';
            const advDetails = document.getElementById('detailsAdvancedTextSettings');
            if (advDetails && !el.dataset.saberActive) advDetails.open = true;

            if (boxGroup) boxGroup.style.display = 'none';
            if (saberBoxRow) saberBoxRow.style.display = 'none';
            if (labelTextGlow) labelTextGlow.textContent = 'Parlama Boyutu';
            if (intensityGroup) intensityGroup.style.display = 'block';

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

        const isDetailsContainer = (el.id === 'elDetails' || !!(el.querySelector && el.querySelector('#infoLineText')));
        if (isDetailsContainer) return; // Detay kutusu şeffaf yapılmamalıdır!

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

    // Başlangıç koruması: elDetails kazara şeffaf kalmışsa veya eski bozuk saber bağlıysa anında onar
    try {
        const elDet = document.getElementById('elDetails');
        if (elDet && elDet.style.color === 'transparent') {
            const activeK = (typeof activeLayout !== 'undefined' && activeLayout) ? activeLayout : 't1';
            const tplDet = (typeof TPL !== 'undefined' && TPL[activeK]) ? TPL[activeK].details : null;
            elDet.style.color = (tplDet && tplDet.color) ? tplDet.color : '#e2e8f0';
            const infoLine = document.getElementById('infoLineText');
            if (infoLine) {
                infoLine.style.color = elDet.style.color;
                infoLine.style.textShadow = '';
            }
            if (window.SaberEngine && typeof window.SaberEngine.removeTextSaber === 'function') {
                window.SaberEngine.removeTextSaber('elDetails');
            }
        }
    } catch(e) {}

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
