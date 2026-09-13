// ================================================================
// ⚡ SABER / NEON UI CONTROLLER
// Neon accordion + preset/renk seçimi + slider ayarları + canlı senkronizasyon
// ================================================================

(function initSaberUI() {
    
    // State
    window.saberState = {
        active: false,
        preset: 'fully-lit',
        colorPreset: 'turkuaz',
        coreColor: 0xFFFFFF,
        glowColor: 0x00CEC9,
        coreSize: 0,
        glowSize: 30,
        intensity: 2.5,
        groundSpill: 0.4,
        energyNodes: true,
        flickerAmount: 0.05,
        pulseSpeed: 0
    };
    
    document.addEventListener('DOMContentLoaded', setup);
    if (document.readyState !== 'loading') setup();
    
    function setup() {
        setupAccordion();
        setupToggle();
        buildPresets();
        buildColors();
        setupSliders();
        setupCustomColors();
        setupClearButton();
        
        // Motoru sessizce başlat (henüz hiçbir şey çizme)
        if (window.SaberEngine && !SaberEngine.getApp()) {
            const container = document.getElementById('canvas-container');
            if (container) SaberEngine.init(container);
        }
        console.log('✅ Neon / Saber UI hazır');
    }
    
    // ═══ ACCORDION AÇIP KAPA ═══
    function setupAccordion() {
        const header = document.getElementById('saberAccordionToggle');
        const content = document.getElementById('saberAccordionContent');
        const accordion = header?.parentElement;
        if (!header || !content) return;
        
        header.addEventListener('click', () => {
            const isOpen = content.style.display !== 'none';
            content.style.display = isOpen ? 'none' : 'block';
            accordion.classList.toggle('open', !isOpen);
            if (!isOpen) {
                if (typeof deselectAll === 'function') deselectAll();
                if (typeof setDrawMode === 'function') setDrawMode('off');
            }
        });
    }
    
    // Kullanıcı bir ayara dokunduğunda neon kapalıysa otomatik aç
    function activateSaberIfInactive() {
        const toggle = document.getElementById('saberModeToggle');
        if (toggle && !toggle.checked) {
            toggle.checked = true;
            window.saberState.active = true;
            console.log('⚡ Neon efektleri otomatik aktifleştirildi');
        } else {
            window.saberState.active = true;
        }
    }
    
    // ═══ SABER MODU TOGGLE ═══
    function setupToggle() {
        const toggle = document.getElementById('saberModeToggle');
        if (!toggle) return;
        
        toggle.addEventListener('change', (e) => {
            window.saberState.active = e.target.checked;
            console.log(e.target.checked ? '⚡ NEON EFEKTLERİ AKTİF' : '🚫 NEON EFEKTLERİ KAPALI');
            
            // Neon açıldığında veya değiştiğinde tuvaldeki seçim ve tutamaçları temizle ("neon açınca bu kaybolmalı")
            if (typeof deselectAll === 'function') deselectAll();
            if (typeof setDrawMode === 'function') setDrawMode('off');
            
            previewSaber();
        });
    }
    
    // ═══ PRESET IZGARASI ═══
    function buildPresets() {
        const grid = document.getElementById('saberPresetGrid');
        if (!grid || !window.SaberEngine) return;
        
        const presets = SaberEngine.presets;
        grid.innerHTML = '';
        
        Object.keys(presets).forEach(key => {
            const p = presets[key];
            const item = document.createElement('div');
            item.className = 'saber-preset-item';
            if (key === window.saberState.preset) item.classList.add('active');
            item.innerHTML = `
                <div class="saber-preset-icon">${p.icon}</div>
                <div class="saber-preset-name">${p.name}</div>
            `;
            item.dataset.preset = key;
            
            item.addEventListener('click', () => {
                activateSaberIfInactive();
                grid.querySelectorAll('.saber-preset-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                window.saberState.preset = key;
                
                // Preset ayarlarını sliderlara uygula
                const s = p.settings;
                if (s.glowSize !== undefined) {
                    const el = document.getElementById('saberGlowSize');
                    if (el) el.value = s.glowSize;
                    const val = document.getElementById('saberGlowSizeVal');
                    if (val) val.textContent = s.glowSize;
                    window.saberState.glowSize = s.glowSize;
                }
                if (s.intensity !== undefined) {
                    const el = document.getElementById('saberIntensity');
                    if (el) el.value = s.intensity;
                    const val = document.getElementById('saberIntensityVal');
                    if (val) val.textContent = s.intensity;
                    window.saberState.intensity = s.intensity;
                }
                if (s.flickerAmount !== undefined) {
                    const flickerVal = Math.round(s.flickerAmount * 100);
                    const el = document.getElementById('saberFlicker');
                    if (el) el.value = flickerVal;
                    const val = document.getElementById('saberFlickerVal');
                    if (val) val.textContent = flickerVal;
                    window.saberState.flickerAmount = s.flickerAmount;
                }
                if (s.pulseSpeed !== undefined) {
                    const el = document.getElementById('saberPulse');
                    if (el) el.value = s.pulseSpeed;
                    const val = document.getElementById('saberPulseVal');
                    if (val) val.textContent = s.pulseSpeed;
                    window.saberState.pulseSpeed = s.pulseSpeed;
                }
                
                // Preset'in kendi rengini uygula
                if (s.coreColor !== undefined) {
                    window.saberState.coreColor = s.coreColor;
                    const cIn = document.getElementById('saberCustomCore');
                    if (cIn) cIn.value = '#' + s.coreColor.toString(16).padStart(6, '0');
                }
                if (s.glowColor !== undefined) {
                    window.saberState.glowColor = s.glowColor;
                    const gIn = document.getElementById('saberCustomGlow');
                    if (gIn) gIn.value = '#' + s.glowColor.toString(16).padStart(6, '0');
                    document.querySelectorAll('.saber-color-item').forEach(el => 
                        el.classList.remove('active'));
                }

                console.log('🎨 Preset uygulandı:', p.name);
                previewSaber();
            });
            
            grid.appendChild(item);
        });
    }
    
    // ═══ RENK IZGARASI ═══
    function buildColors() {
        const grid = document.getElementById('saberColorGrid');
        if (!grid || !window.SaberEngine) return;
        
        const colors = SaberEngine.colorPresets;
        grid.innerHTML = '';
        
        Object.keys(colors).forEach(key => {
            const c = colors[key];
            const hexGlow = '#' + c.glow.toString(16).padStart(6, '0');
            
            const item = document.createElement('div');
            item.className = 'saber-color-item';
            if (key === window.saberState.colorPreset) item.classList.add('active');
            item.style.backgroundColor = hexGlow;
            item.title = key;
            item.dataset.color = key;
            
            item.addEventListener('click', () => {
                activateSaberIfInactive();
                grid.querySelectorAll('.saber-color-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                window.saberState.colorPreset = key;
                window.saberState.coreColor = c.core;
                window.saberState.glowColor = c.glow;
                
                // Custom color inputlarını güncelle
                const gIn = document.getElementById('saberCustomGlow');
                if (gIn) gIn.value = hexGlow;
                const cIn = document.getElementById('saberCustomCore');
                if (cIn) cIn.value = '#' + c.core.toString(16).padStart(6, '0');
                
                console.log('🎨 Renk seçildi:', key);
                previewSaber();
            });
            
            grid.appendChild(item);
        });
    }
    
    // ═══ SLIDER'LAR (Hızlı Canlı Güncelleme & Geçici Kalite Düşürme) ═══
    let _isUserSlidingSaber = false;
    let _sliderRafId = null;

    function scheduleSaberSliderUpdate(isSliding = false) {
        if (_sliderRafId) {
            cancelAnimationFrame(_sliderRafId);
            _sliderRafId = null;
        }
        
        if (isSliding) {
            _isUserSlidingSaber = true;
            _sliderRafId = requestAnimationFrame(() => {
                _sliderRafId = null;
                previewSaber(true, true);
            });
        } else {
            _isUserSlidingSaber = false;
            previewSaber(true, false);
        }
    }

    // Kullanıcı mouse veya parmağını slider dışına kaydırıp bıraksa bile tam kaliteye dönsün
    window.addEventListener('pointerup', () => {
        if (_isUserSlidingSaber) {
            scheduleSaberSliderUpdate(false);
        }
    });
    window.addEventListener('touchend', () => {
        if (_isUserSlidingSaber) {
            scheduleSaberSliderUpdate(false);
        }
    });

    function setupSliders() {
        const sliders = [
            { id: 'saberCoreSize', valId: 'saberCoreSizeVal', stateKey: 'coreSize', parse: parseInt },
            { id: 'saberGlowSize', valId: 'saberGlowSizeVal', stateKey: 'glowSize', parse: parseInt },
            { id: 'saberIntensity', valId: 'saberIntensityVal', stateKey: 'intensity', parse: parseFloat },
            { id: 'saberFlicker', valId: 'saberFlickerVal', stateKey: 'flickerAmount', parse: (v) => parseInt(v) / 100 },
            { id: 'saberPulse', valId: 'saberPulseVal', stateKey: 'pulseSpeed', parse: parseFloat },
            { id: 'saberGroundSpill', valId: 'saberGroundSpillVal', stateKey: 'groundSpill', parse: (v) => parseInt(v) / 100 }
        ];

        const nodeCheckbox = document.getElementById('saberEnergyNodes');
        if (nodeCheckbox) {
            nodeCheckbox.addEventListener('change', (e) => {
                activateSaberIfInactive();
                window.saberState.energyNodes = e.target.checked;
                previewSaber(true, false);
            });
        }
        
        sliders.forEach(s => {
            const input = document.getElementById(s.id);
            const val = document.getElementById(s.valId);
            if (!input || !val) return;
            
            input.addEventListener('input', () => {
                activateSaberIfInactive();
                const displayVal = s.stateKey === 'groundSpill' ? (input.value + '%') : input.value;
                val.textContent = displayVal;
                window.saberState[s.stateKey] = s.parse(input.value);
                // Sürükleme esnasında anında 120 FPS akıcı ve geçici hafif kaliteli güncelleme
                scheduleSaberSliderUpdate(true);
            });

            // Slider bırakıldığı an tam kaliteye geri dön
            input.addEventListener('change', () => {
                scheduleSaberSliderUpdate(false);
            });
        });
    }
    
    // ═══ ÖZEL RENK PICKER ═══
    function setupCustomColors() {
        const glow = document.getElementById('saberCustomGlow');
        const core = document.getElementById('saberCustomCore');
        
        if (glow) {
            glow.addEventListener('input', () => {
                activateSaberIfInactive();
                window.saberState.glowColor = parseInt(glow.value.replace('#', ''), 16);
                document.querySelectorAll('.saber-color-item').forEach(el => el.classList.remove('active'));
                scheduleSaberSliderUpdate(true);
            });
            glow.addEventListener('change', () => {
                scheduleSaberSliderUpdate(false);
            });
        }
        
        if (core) {
            core.addEventListener('input', () => {
                activateSaberIfInactive();
                window.saberState.coreColor = parseInt(core.value.replace('#', ''), 16);
                scheduleSaberSliderUpdate(true);
            });
            core.addEventListener('change', () => {
                scheduleSaberSliderUpdate(false);
            });
        }
    }
    
    // ═══ TEMİZLE BUTONU ═══
    function setupClearButton() {
        const btn = document.getElementById('saberClearBtn');
        if (!btn) return;
        
        btn.addEventListener('click', () => {
            if (typeof drawPaths !== 'undefined') {
                drawPaths.forEach(p => {
                    p.hasSaber = false;
                    p.saber = false;
                    if (typeof window.updateSinglePathSvg === 'function') {
                        window.updateSinglePathSvg(p);
                    }
                });
            }
            if (window.SaberEngine) {
                SaberEngine.clear();
            }
            const toggle = document.getElementById('saberModeToggle');
            if (toggle) toggle.checked = false;
            window.saberState.active = false;
            if (typeof redrawAll === 'function') redrawAll();
            if (typeof updateDrawHistory === 'function') updateDrawHistory();
            console.log('🗑️ Neon efektleri temizlendi');
        });
    }
    
    // ═══ SEÇİLİ ÇİZİM İLE SABER PANELİNİ SENKRONİZE ET ═══
    window.syncSaberUIWithDrawing = function(p) {
        if (!p) return;
        // Çoklu seçim varsa tek bir çizimin durumuna göre global neon durumunu ezme
        if (window.selectedElements && window.selectedElements.length > 1) {
            const hasAnySaber = window.selectedElements.some(el => {
                const pathObj = typeof drawPaths !== 'undefined' && drawPaths.find(dp => dp.el === el);
                return pathObj && (pathObj.hasSaber || pathObj.saber);
            });
            if (hasAnySaber) {
                window.saberState.active = true;
                const toggle = document.getElementById('saberModeToggle');
                if (toggle) toggle.checked = true;
            }
            return;
        }
        const toggle = document.getElementById('saberModeToggle');
        const isNeon = !!(p.hasSaber || p.saber);
        window.saberState.active = isNeon;
        if (toggle) toggle.checked = isNeon;
        
        if (isNeon && p.saberOptions) {
            Object.assign(window.saberState, p.saberOptions);
            
            // Sliderları güncelle
            const coreInput = document.getElementById('saberCoreSize');
            if (coreInput && window.saberState.coreSize !== undefined) {
                coreInput.value = window.saberState.coreSize;
                const v = document.getElementById('saberCoreSizeVal');
                if (v) v.textContent = window.saberState.coreSize;
            }
            const glowInput = document.getElementById('saberGlowSize');
            if (glowInput && window.saberState.glowSize !== undefined) {
                glowInput.value = window.saberState.glowSize;
                const v = document.getElementById('saberGlowSizeVal');
                if (v) v.textContent = window.saberState.glowSize;
            }
            const intInput = document.getElementById('saberIntensity');
            if (intInput && window.saberState.intensity !== undefined) {
                intInput.value = window.saberState.intensity;
                const v = document.getElementById('saberIntensityVal');
                if (v) v.textContent = window.saberState.intensity;
            }
            const fInput = document.getElementById('saberFlicker');
            if (fInput && window.saberState.flickerAmount !== undefined) {
                const fVal = Math.round(window.saberState.flickerAmount * 100);
                fInput.value = fVal;
                const v = document.getElementById('saberFlickerVal');
                if (v) v.textContent = fVal;
            }
            const pInput = document.getElementById('saberPulse');
            if (pInput && window.saberState.pulseSpeed !== undefined) {
                pInput.value = window.saberState.pulseSpeed;
                const v = document.getElementById('saberPulseVal');
                if (v) v.textContent = window.saberState.pulseSpeed;
            }
            const gInput = document.getElementById('saberGroundSpill');
            if (gInput && window.saberState.groundSpill !== undefined) {
                const gVal = Math.round(window.saberState.groundSpill * 100);
                gInput.value = gVal;
                const v = document.getElementById('saberGroundSpillVal');
                if (v) v.textContent = gVal + '%';
            }
            const nodeCb = document.getElementById('saberEnergyNodes');
            if (nodeCb && window.saberState.energyNodes !== undefined) {
                nodeCb.checked = window.saberState.energyNodes !== false;
            }
            
            // Preset kartını vurgula
            const grid = document.getElementById('saberPresetGrid');
            if (grid && window.saberState.preset) {
                grid.querySelectorAll('.saber-preset-item').forEach(el => {
                    el.classList.toggle('active', el.dataset.preset === window.saberState.preset);
                });
            }
            
            // Renk ikonunu vurgula
            const colorGrid = document.getElementById('saberColorGrid');
            if (colorGrid && window.saberState.colorPreset) {
                colorGrid.querySelectorAll('.saber-color-item').forEach(el => {
                    el.classList.toggle('active', el.dataset.color === window.saberState.colorPreset);
                });
            }
            
            // Özel renk pickler
            if (window.saberState.glowColor) {
                const gHex = typeof window.saberState.glowColor === 'number' 
                    ? '#' + window.saberState.glowColor.toString(16).padStart(6, '0') 
                    : window.saberState.glowColor;
                const gEl = document.getElementById('saberCustomGlow');
                if (gEl) gEl.value = gHex;
            }
            if (window.saberState.coreColor) {
                const cHex = typeof window.saberState.coreColor === 'number' 
                    ? '#' + window.saberState.coreColor.toString(16).padStart(6, '0') 
                    : window.saberState.coreColor;
                const cEl = document.getElementById('saberCustomCore');
                if (cEl) cEl.value = cHex;
            }
        }
    };
    
    // ═══ CANLI GÜNCELLEME (SEÇİLİ VEYA MEVCUT ÇİZİMLER İÇİN) ═══
    function previewSaber(inPlace = false, isSliding = false) {
        let targetEls = [];
        if (window.selectedElements && window.selectedElements.length > 0) {
            targetEls = [...window.selectedElements];
        } else if (window.selectedEl) {
            targetEls = [window.selectedEl];
        }
        
        let targetPaths = [];
        if (typeof drawPaths !== 'undefined' && drawPaths.length > 0) {
            targetEls.forEach(rawEl => {
                if (!rawEl) return;
                const el = (rawEl.classList && rawEl.classList.contains('editable-draw')) 
                    ? rawEl 
                    : (rawEl.closest ? rawEl.closest('.editable-draw') : null);
                if (el) {
                    const found = drawPaths.find(p => p.el === el || (p.el && (p.el === el || p.el.contains(el) || el.contains(p.el))));
                    if (found && !targetPaths.includes(found)) {
                        targetPaths.push(found);
                    }
                }
            });
            
            // Eğer editingDrawIndex aktifse, onu da ekle
            if (targetPaths.length === 0 && typeof editingDrawIndex !== 'undefined' && editingDrawIndex >= 0 && drawPaths[editingDrawIndex]) {
                targetPaths.push(drawPaths[editingDrawIndex]);
            }
            
            // Eğer hiçbir çizim seçili değilse, tuvaldeki TÜM çizimleri neon moduna al
            if (targetPaths.length === 0 && typeof drawPaths !== 'undefined') {
                targetPaths = [...drawPaths];
            }

            // Neon modu aktifken, tuvaldeki zaten neonlu olan diğer tüm çizimleri de güncel ayarlarla senkron tut
            if (window.saberState.active && typeof drawPaths !== 'undefined') {
                drawPaths.forEach(p => {
                    if ((p.hasSaber || p.saber) && !targetPaths.includes(p)) {
                        targetPaths.push(p);
                    }
                });
            }
        }
        
        // Hedeflenen tüm çizimlere neon ayarlarını uygula
        targetPaths.forEach(p => {
            p.hasSaber = !!window.saberState.active;
            p.saber = !!window.saberState.active;
            p.saberOptions = JSON.parse(JSON.stringify(window.saberState));
            
            if (window.saberState.active) {
                let glowHex = '#00CEC9';
                if (window.saberState.glowColor) {
                    glowHex = typeof window.saberState.glowColor === 'number'
                        ? '#' + window.saberState.glowColor.toString(16).padStart(6, '0')
                        : window.saberState.glowColor;
                }
                p.color = glowHex;
                if (!p.fillColor || p.fillColor === '#ef4444' || p.fillColor === '#e74c3c') {
                    p.fillColor = glowHex;
                }
                if (typeof editingDrawIndex !== 'undefined' && editingDrawIndex >= 0 && typeof drawPaths !== 'undefined' && drawPaths[editingDrawIndex] === p) {
                    const deCol = document.getElementById('deColor');
                    if (deCol) deCol.value = glowHex;
                    const deFill = document.getElementById('deFillColor');
                    if (deFill && (!p.fillColor || p.fillColor === glowHex)) deFill.value = glowHex;
                }
            }
            
            if (inPlace && p.saberRef && window.SaberEngine && window.SaberEngine.updateSaberParameters) {
                // ⚡ Hızlı in-place güncelleme (filtre shaders silip yaratmadan)
                window.SaberEngine.updateSaberParameters(p.saberRef, window.saberState, isSliding);
                if (!isSliding && typeof window.updateSinglePathSvg === 'function') {
                    window.updateSinglePathSvg(p);
                }
            } else {
                if (typeof window.updateSinglePathSvg === 'function') {
                    window.updateSinglePathSvg(p);
                }
                if (typeof drawPaths !== 'undefined') {
                    const idx = drawPaths.indexOf(p);
                    if (idx > -1) {
                        if (window.saberState.active && window.applySaberToPath) {
                            window.applySaberToPath(idx, p.saberOptions);
                        } else if (!window.saberState.active && window.removeSaberFromPath) {
                            window.removeSaberFromPath(idx);
                        }
                    }
                }
            }
        });
        
        if (typeof updateDrawHistory === 'function') {
            updateDrawHistory();
        }
        
        const isAnimActive = (typeof window.isSaberAnimationActive === 'function')
            ? window.isSaberAnimationActive()
            : document.body.classList.contains('saber-animation-active');

        if (window.saberState.active && window.SaberEngine) {
            const app = window.SaberEngine.getApp();
            if (app && app.ticker) {
                if (isAnimActive && !app.ticker.started) {
                    app.ticker.start();
                } else if (!isAnimActive) {
                    if (app.ticker.started) app.ticker.stop();
                    if (app.renderer && app.stage) {
                        try { app.renderer.render(app.stage); } catch(e) {}
                    }
                }
            }
        } else if (!window.saberState.active && targetPaths.length === 0 && window.SaberEngine) {
            window.SaberEngine.clear();
        }
        
        // Sürükleme (isSliding) esnasında ağır DOM ve tuval yeniden çizimlerini atla (120 FPS akıcılık)
        if (!isSliding) {
            if (typeof redrawAll === 'function') redrawAll();
            if (typeof updateDrawHistory === 'function') updateDrawHistory();
        }
    }
    
    window.previewSaber = previewSaber;
    
})();

console.log('⚡ Saber UI yüklendi');
