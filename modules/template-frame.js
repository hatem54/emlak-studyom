/**
 * ============================================================
 * EMLAK STÜDYOM - ŞABLON DIŞ ÇERÇEVE & NEON MOTORU (V1.0)
 * ============================================================
 * Standart ve Minimal Şablonlar için donanım hızlandırmalı
 * ayarlanabilir dış çerçeve çizgisi ve neon ışıma sistemi.
 */

(function(window) {
    'use strict';

    const DEFAULT_CONFIG = {
        enabled: false,
        color: '#38bdf8',
        glowSize: 20,
        glowDirection: 'both',
        borderWidth: 2,
        borderRadius: 20,
        inset: 36
    };

    // Standart Şablonlar (t1 - t10) İçin Ön Tanımlı Dış Çerçeve Ayarları
    const STANDARD_TEMPLATE_FRAMES = {
        't1': { enabled: true, color: '#38bdf8', glowSize: 22, borderWidth: 2, borderRadius: 20, inset: 36 },
        't2': { enabled: true, color: '#fbbf24', glowSize: 24, borderWidth: 2, borderRadius: 16, inset: 36 },
        't3': { enabled: true, color: '#ec4899', glowSize: 26, borderWidth: 2.5, borderRadius: 32, inset: 36 },
        't4': { enabled: true, color: '#e2e8f0', glowSize: 12, borderWidth: 1.5, borderRadius: 0, inset: 36 },
        't5': { enabled: true, color: 'rgba(255,255,255,0.85)', glowSize: 22, borderWidth: 1.5, borderRadius: 26, inset: 36 },
        't6': { enabled: true, color: '#10b981', glowSize: 24, borderWidth: 2, borderRadius: 18, inset: 36 },
        't7': { enabled: true, color: '#3b82f6', glowSize: 24, borderWidth: 2, borderRadius: 18, inset: 36 },
        't8': { enabled: true, color: '#ef4444', glowSize: 24, borderWidth: 2, borderRadius: 14, inset: 36 },
        't9': { enabled: true, color: '#e2e8f0', glowSize: 16, borderWidth: 2, borderRadius: 12, inset: 36 },
        't10': { enabled: true, color: '#f97316', glowSize: 24, borderWidth: 2, borderRadius: 20, inset: 36 }
    };

    // Minimal ve Özel Canva Şablonları İçin Ön Tanımlı Dış Çerçeve Ayarları
    const MINIMAL_TEMPLATE_FRAMES = {
        'canvaM2': { enabled: true, color: '#38bdf8', glowSize: 22, borderWidth: 1.5, borderRadius: 20, inset: 32 },
        'canvaM3': { enabled: true, color: '#f59e0b', glowSize: 18, borderWidth: 1.5, borderRadius: 0, inset: 36 },
        'canvaM10': { enabled: true, color: '#0f172a', glowSize: 0, borderWidth: 2, borderRadius: 0, inset: 50 },
        'canvaP5': { enabled: true, color: '#166534', glowSize: 16, borderWidth: 2, borderRadius: 0, inset: 40 }
    };

    function hexToRgba(hex, alpha) {
        if (!hex) return `rgba(56, 189, 248, ${alpha})`;
        if (hex.startsWith('rgba')) {
            return hex.replace(/[\d\.]+\)$/, `${alpha})`);
        }
        if (hex.startsWith('rgb(')) {
            return hex.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
        }
        let c = hex.replace('#', '');
        if (c.length === 3) c = c.split('').map(x => x + x).join('');
        const num = parseInt(c, 16);
        if (isNaN(num)) return `rgba(56, 189, 248, ${alpha})`;
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function colorToHex(colorStr) {
        if (!colorStr) return '#38bdf8';
        colorStr = String(colorStr).trim();
        if (colorStr.startsWith('#')) {
            if (colorStr.length === 4) {
                return '#' + colorStr[1] + colorStr[1] + colorStr[2] + colorStr[2] + colorStr[3] + colorStr[3];
            }
            return colorStr.slice(0, 7);
        }
        const m = colorStr.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
        if (m) {
            const r = Math.min(255, parseInt(m[1], 10)).toString(16).padStart(2, '0');
            const g = Math.min(255, parseInt(m[2], 10)).toString(16).padStart(2, '0');
            const b = Math.min(255, parseInt(m[3], 10)).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        }
        if (colorStr.toLowerCase() === 'white') return '#ffffff';
        if (colorStr.toLowerCase() === 'black') return '#000000';
        return '#38bdf8';
    }

    function buildNeonGlow(color, glowSize, glowDirection) {
        if (!glowSize || glowSize <= 0) return 'none';
        const g1 = (glowSize * 0.35).toFixed(1);
        const g2 = parseFloat(glowSize).toFixed(1);
        const g3 = (glowSize * 1.5).toFixed(1);
        const c1 = hexToRgba(color, 0.85);
        const c2 = hexToRgba(color, 0.55);
        const c3 = hexToRgba(color, 0.25);

        const outerGlow = `0 0 ${g1}px ${c1}, 0 0 ${g2}px ${c2}, 0 0 ${g3}px ${c3}`;
        const innerGlow = `inset 0 0 ${g1}px ${c1}, inset 0 0 ${g2}px ${c2}, inset 0 0 ${g3}px ${c3}`;

        const dir = glowDirection || 'both';
        if (dir === 'outer') {
            return outerGlow;
        } else if (dir === 'inner') {
            return innerGlow;
        } else {
            return `${outerGlow}, ${innerGlow}`;
        }
    }

    const TemplateFrame = {
        config: Object.assign({}, DEFAULT_CONFIG),
        _rafId: null,

        ensureElement: function() {
            let el = document.getElementById('tplOuterFrame');
            const canvasContainer = document.getElementById('canvas-container');
            if (!el && canvasContainer) {
                el = document.createElement('div');
                el.id = 'tplOuterFrame';
                el.className = 'tpl-outer-frame';
                el.dataset.tplFrame = 'true';
            }

            if (canvasContainer && el && el.parentElement !== canvasContainer) {
                const uiLayer = document.getElementById('ui-layer');
                if (uiLayer) {
                    canvasContainer.insertBefore(el, uiLayer);
                } else {
                    canvasContainer.appendChild(el);
                }
            }

            if (el) {
                el.style.zIndex = '25';
                el.style.pointerEvents = 'none';
            }

            return el;
        },

        apply: function(newConfig) {
            if (newConfig) {
                this.config = Object.assign({}, this.config, newConfig);
            }

            const el = this.ensureElement();
            if (!el) return;

            if (!this.config.enabled) {
                el.style.display = 'none';
                this.syncUI();
                return;
            }

            el.style.display = 'block';
            el.style.position = 'absolute';
            el.style.boxSizing = 'border-box';
            el.style.pointerEvents = 'none';

            const inset = (this.config.inset !== undefined) ? parseInt(this.config.inset) : 36;
            el.style.left = inset + 'px';
            el.style.top = inset + 'px';
            el.style.right = inset + 'px';
            el.style.bottom = inset + 'px';

            const width = (this.config.borderWidth !== undefined) ? parseFloat(this.config.borderWidth) : 2;
            const color = this.config.color || '#38bdf8';
            el.style.border = `${width}px solid ${color}`;

            const radius = (this.config.borderRadius !== undefined) ? parseInt(this.config.borderRadius) : 20;
            el.style.borderRadius = `${radius}px`;

            const glow = (this.config.glowSize !== undefined) ? parseInt(this.config.glowSize) : 20;
            const glowDir = this.config.glowDirection || 'both';
            el.style.boxShadow = buildNeonGlow(color, glow, glowDir);

            if (glow > 0) {
                el.classList.add('neon-glow');
            } else {
                el.classList.remove('neon-glow');
            }

            this.syncUI();
        },

        applyStandard: function(templateKey) {
            let tplFrame = null;
            if (window.TPL && window.TPL[templateKey] && window.TPL[templateKey].frame) {
                tplFrame = window.TPL[templateKey].frame;
            }
            const preset = STANDARD_TEMPLATE_FRAMES[templateKey] || (tplFrame ? {
                enabled: true,
                color: tplFrame.color || '#38bdf8',
                glowSize: (tplFrame.glowSize !== undefined) ? tplFrame.glowSize : 20,
                glowDirection: tplFrame.glowDirection || 'both',
                borderWidth: (tplFrame.borderWidth !== undefined) ? tplFrame.borderWidth : 2,
                borderRadius: (tplFrame.borderRadius !== undefined) ? tplFrame.borderRadius : 20,
                inset: (tplFrame.inset !== undefined) ? tplFrame.inset : 36
            } : {
                enabled: true,
                color: '#38bdf8',
                glowSize: 20,
                glowDirection: 'both',
                borderWidth: 2,
                borderRadius: 20,
                inset: 36
            });
            this.apply(preset);
        },

        applyForCanva: function(templateId) {
            if (MINIMAL_TEMPLATE_FRAMES[templateId]) {
                this.apply(MINIMAL_TEMPLATE_FRAMES[templateId]);
            } else {
                // Varsayılan olarak çerçeve açık değilse gizle, kullanıcı isterse açabilir
                if (!this.config.enabled) {
                    this.hide();
                } else {
                    this.apply();
                }
            }
        },

        applyForMinimal: function(templateId) {
            this.applyForCanva(templateId);
        },

        onTemplateChanged: function(templateId, category) {
            if (!templateId) return;
            if (category === 'standard' || (typeof templateId === 'string' && templateId.startsWith('t') && (STANDARD_TEMPLATE_FRAMES[templateId] || (window.TPL && window.TPL[templateId])))) {
                this.applyStandard(templateId);
            } else {
                this.applyForCanva(templateId);
            }
        },

        toggle: function(forceState) {
            const nextState = (forceState !== undefined) ? !!forceState : !this.config.enabled;
            this.config.enabled = nextState;
            this.apply();
            if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
        },

        hide: function() {
            this.config.enabled = false;
            const el = document.getElementById('tplOuterFrame');
            if (el) el.style.display = 'none';
            this.syncUI();
        },

        clear: function() {
            this.hide();
        },

        toggleVisibility: function(isVisible) {
            const el = document.getElementById('tplOuterFrame');
            if (!el) return;
            if (isVisible === undefined) {
                isVisible = el.style.display === 'none';
            }
            if (isVisible && this.config.enabled) {
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        },

        updateFromUI: function(changedSource) {
            if (this._rafId) cancelAnimationFrame(this._rafId);
            this._rafId = requestAnimationFrame(() => {
                const colorInput = document.getElementById('tplFrameColor');
                const glowInput = document.getElementById('tplFrameGlow');
                const glowDirInput = document.getElementById('tplFrameGlowDirection');
                const widthInput = document.getElementById('tplFrameWidth');
                const radiusInput = document.getElementById('tplFrameRadius');
                const insetInput = document.getElementById('tplFrameInset');

                // Sadece kullanıcı renk seçiciyi değiştirdiyse veya seçicideki renk konfigürasyondan farklıysa rengi güncelle
                if (colorInput && colorInput.value) {
                    const currentHex = colorToHex(this.config.color);
                    if (changedSource === 'color' || (currentHex.toLowerCase() !== colorInput.value.toLowerCase())) {
                        this.config.color = colorInput.value;
                    }
                }
                if (glowInput) {
                    this.config.glowSize = parseInt(glowInput.value) || 0;
                    const v = document.getElementById('tplFrameGlowVal');
                    if (v) v.textContent = this.config.glowSize + 'px';
                }
                if (glowDirInput) {
                    this.config.glowDirection = glowDirInput.value || 'both';
                }
                if (widthInput) {
                    this.config.borderWidth = parseFloat(widthInput.value) || 1;
                    const v = document.getElementById('tplFrameWidthVal');
                    if (v) {
                        const bw = this.config.borderWidth;
                        v.textContent = (Number.isInteger(bw) ? bw : bw.toFixed(1)) + 'px';
                    }
                }
                if (radiusInput) {
                    this.config.borderRadius = parseInt(radiusInput.value) || 0;
                    const v = document.getElementById('tplFrameRadiusVal');
                    if (v) v.textContent = this.config.borderRadius + 'px';
                }
                if (insetInput) {
                    this.config.inset = parseInt(insetInput.value) || 36;
                    const v = document.getElementById('tplFrameInsetVal');
                    if (v) v.textContent = this.config.inset + 'px';
                }

                // Kullanıcı ayar değiştirdiğinde çerçeveyi otomatik aktif hale getir
                this.config.enabled = true;
                this.apply();
                if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
                this._rafId = null;
            });
        },

        syncUI: function() {
            const colorInput = document.getElementById('tplFrameColor');
            const glowInput = document.getElementById('tplFrameGlow');
            const glowVal = document.getElementById('tplFrameGlowVal');
            const glowDirInput = document.getElementById('tplFrameGlowDirection');
            const widthInput = document.getElementById('tplFrameWidth');
            const widthVal = document.getElementById('tplFrameWidthVal');
            const radiusInput = document.getElementById('tplFrameRadius');
            const radiusVal = document.getElementById('tplFrameRadiusVal');
            const insetInput = document.getElementById('tplFrameInset');
            const insetVal = document.getElementById('tplFrameInsetVal');

            const btn = document.getElementById('btnToggleTemplateFrame');
            const btnText = document.getElementById('btnToggleTemplateFrameText');

            if (colorInput && this.config.color) {
                try {
                    colorInput.value = colorToHex(this.config.color);
                } catch(e) {}
            }
            if (glowInput) {
                glowInput.value = this.config.glowSize;
                if (glowVal) glowVal.textContent = this.config.glowSize + 'px';
            }
            if (glowDirInput && this.config.glowDirection) {
                glowDirInput.value = this.config.glowDirection;
            }
            if (widthInput) {
                widthInput.value = this.config.borderWidth;
                if (widthVal) {
                    const bw = parseFloat(this.config.borderWidth) || 1;
                    widthVal.textContent = (Number.isInteger(bw) ? bw : bw.toFixed(1)) + 'px';
                }
            }
            if (radiusInput) {
                radiusInput.value = this.config.borderRadius;
                if (radiusVal) radiusVal.textContent = this.config.borderRadius + 'px';
            }
            if (insetInput) {
                insetInput.value = this.config.inset;
                if (insetVal) insetVal.textContent = this.config.inset + 'px';
            }

            if (btn) {
                if (this.config.enabled) {
                    btn.classList.add('active');
                    if (btnText) btnText.textContent = 'Çerçeveyi Kapat';
                } else {
                    btn.classList.remove('active');
                    if (btnText) btnText.textContent = 'Çerçeveyi Aç';
                }
            }
        },

        resetSetting: function(type) {
            const def = DEFAULT_CONFIG;
            if (type === 'color') this.config.color = def.color;
            else if (type === 'glow') this.config.glowSize = def.glowSize;
            else if (type === 'glowDir') this.config.glowDirection = def.glowDirection;
            else if (type === 'width') this.config.borderWidth = def.borderWidth;
            else if (type === 'radius') this.config.borderRadius = def.borderRadius;
            else if (type === 'inset') this.config.inset = def.inset;

            this.apply();
            if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
        },

        initResetListeners: function() {
            const mapping = [
                { id: 'tplFrameColor', type: 'color' },
                { id: 'tplFrameGlow', type: 'glow' },
                { id: 'tplFrameGlowDirection', type: 'glowDir' },
                { id: 'tplFrameWidth', type: 'width' },
                { id: 'tplFrameRadius', type: 'radius' },
                { id: 'tplFrameInset', type: 'inset' }
            ];
            mapping.forEach(m => {
                const el = document.getElementById(m.id);
                if (el) {
                    el.title = 'Varsayılana dönmek için çift tıklayın';
                    el.addEventListener('dblclick', (e) => {
                        e.stopPropagation();
                        TemplateFrame.resetSetting(m.type);
                    });
                    const parent = el.closest('.slider-group, .color-row, .select-row');
                    if (parent) {
                        parent.title = 'Varsayılana dönmek için çift tıklayın';
                        parent.addEventListener('dblclick', (e) => {
                            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
                                TemplateFrame.resetSetting(m.type);
                            }
                        });
                    }
                }
            });
        }
    };

    window.TemplateFrame = TemplateFrame;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            TemplateFrame.initResetListeners();
        });
    } else {
        TemplateFrame.initResetListeners();
    }

})(window);
