// ================================================================
// ⚡ SABER UI CONTROLLER
// Saber accordion + preset/renk seçimi + slider ayarları
// ================================================================

(function initSaberUI() {
    
    // State
    window.saberState = {
        active: false,
        preset: 'fully-lit',
        colorPreset: 'mavi',
        coreColor: 0xFFFFFF,
        glowColor: 0x00AAFF,
        coreSize: 4,
        glowSize: 30,
        intensity: 2.5,
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
        console.log('✅ Saber UI hazır');
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
        });
    }
    
    // ═══ SABER MODU TOGGLE ═══
    function setupToggle() {
        const toggle = document.getElementById('saberModeToggle');
        if (!toggle) return;
        
        toggle.addEventListener('change', (e) => {
            window.saberState.active = e.target.checked;
            console.log(e.target.checked ? '⚡ SABER AKTİF' : '🚫 SABER KAPALI');
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
                <div>${p.icon}</div>
                <div class="saber-preset-name">${p.name}</div>
            `;
            item.dataset.preset = key;
            
            item.addEventListener('click', () => {
                grid.querySelectorAll('.saber-preset-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                window.saberState.preset = key;
                
                // Preset ayarlarını sliderlara uygula
                const s = p.settings;
                if (s.glowSize !== undefined) {
                    document.getElementById('saberGlowSize').value = s.glowSize;
                    document.getElementById('saberGlowSizeVal').textContent = s.glowSize;
                    window.saberState.glowSize = s.glowSize;
                }
                if (s.intensity !== undefined) {
                    document.getElementById('saberIntensity').value = s.intensity;
                    document.getElementById('saberIntensityVal').textContent = s.intensity;
                    window.saberState.intensity = s.intensity;
                }
                if (s.flickerAmount !== undefined) {
                    const flickerVal = Math.round(s.flickerAmount * 100);
                    document.getElementById('saberFlicker').value = flickerVal;
                    document.getElementById('saberFlickerVal').textContent = flickerVal;
                    window.saberState.flickerAmount = s.flickerAmount;
                }
                if (s.pulseSpeed !== undefined) {
                    document.getElementById('saberPulse').value = s.pulseSpeed;
                    document.getElementById('saberPulseVal').textContent = s.pulseSpeed;
                    window.saberState.pulseSpeed = s.pulseSpeed;
                }
                
                // Preset'in kendi rengini uygula
                if (s.coreColor !== undefined) {
                    window.saberState.coreColor = s.coreColor;
                    document.getElementById('saberCustomCore').value = 
                        '#' + s.coreColor.toString(16).padStart(6, '0');
                }
                if (s.glowColor !== undefined) {
                    window.saberState.glowColor = s.glowColor;
                    document.getElementById('saberCustomGlow').value = 
                        '#' + s.glowColor.toString(16).padStart(6, '0');
                    // Preset renk paletindeki active class'ı kaldır
                    document.querySelectorAll('.saber-color-item').forEach(el => 
                        el.classList.remove('active'));
                }

                console.log('🎨 Preset:', p.name);
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
            item.style.background = hexGlow;
            item.style.color = hexGlow;
            item.title = key;
            item.dataset.color = key;
            
            item.addEventListener('click', () => {
                grid.querySelectorAll('.saber-color-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                window.saberState.colorPreset = key;
                window.saberState.coreColor = c.core;
                window.saberState.glowColor = c.glow;
                
                // Custom color inputlarını da güncelle
                document.getElementById('saberCustomGlow').value = hexGlow;
                document.getElementById('saberCustomCore').value = '#' + c.core.toString(16).padStart(6, '0');
                
                console.log('🎨 Renk:', key);
                previewSaber();
            });
            
            grid.appendChild(item);
        });
    }
    
    // ═══ SLIDER'LAR ═══
    function setupSliders() {
        const sliders = [
            { id: 'saberCoreSize', valId: 'saberCoreSizeVal', stateKey: 'coreSize', parse: parseInt },
            { id: 'saberGlowSize', valId: 'saberGlowSizeVal', stateKey: 'glowSize', parse: parseInt },
            { id: 'saberIntensity', valId: 'saberIntensityVal', stateKey: 'intensity', parse: parseFloat },
            { id: 'saberFlicker', valId: 'saberFlickerVal', stateKey: 'flickerAmount', parse: (v) => parseInt(v) / 100 },
            { id: 'saberPulse', valId: 'saberPulseVal', stateKey: 'pulseSpeed', parse: parseFloat }
        ];
        
        sliders.forEach(s => {
            const input = document.getElementById(s.id);
            const val = document.getElementById(s.valId);
            if (!input || !val) return;
            
            input.addEventListener('input', () => {
                const displayVal = s.stateKey === 'flickerAmount' ? input.value : input.value;
                val.textContent = displayVal;
                window.saberState[s.stateKey] = s.parse(input.value);
                previewSaber();
            });
        });
    }
    
    // ═══ ÖZEL RENK PICKER ═══
    function setupCustomColors() {
        const glow = document.getElementById('saberCustomGlow');
        const core = document.getElementById('saberCustomCore');
        
        if (glow) {
            glow.addEventListener('input', () => {
                window.saberState.glowColor = parseInt(glow.value.replace('#', ''), 16);
                // Preset renk seçimini kaldır
                document.querySelectorAll('.saber-color-item').forEach(el => el.classList.remove('active'));
                previewSaber();
            });
        }
        
        if (core) {
            core.addEventListener('input', () => {
                window.saberState.coreColor = parseInt(core.value.replace('#', ''), 16);
                previewSaber();
            });
        }
    }
    
    // ═══ TEMİZLE BUTONU ═══
    function setupClearButton() {
        const btn = document.getElementById('saberClearBtn');
        if (!btn) return;
        
        btn.addEventListener('click', () => {
            if (window.SaberEngine) {
                SaberEngine.clear();
                console.log('🗑️ Saber temizlendi');
            }
        });
    }
    
    // ═══ CANLI ÖNIZLEME (TEST ÇİZGİSİ) ═══
    function previewSaber() {
        // Preview özelliği kaldırıldı - kullanıcı 
        // çizim yaparken doğal olarak görecek.
        // Motor sadece ilk çizimde başlatılır.
    }
    
})();

console.log('⚡ Saber UI yüklendi');
