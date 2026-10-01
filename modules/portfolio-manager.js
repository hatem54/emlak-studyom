/**
 * ========================================================
 * EMLAK STÜDYOM - HAZIR PORTFÖY VİTRİNİ YÖNETİCİSİ
 * modules/portfolio-manager.js
 * ========================================================
 */

(function(window) {
    'use strict';

    const PortfolioManager = {
        activeCategory: 'all',
        searchQuery: '',
        presets: [],

        init: function() {
            if (typeof window.PortfolioPresetsData !== 'undefined' && Array.isArray(window.PortfolioPresetsData)) {
                this.presets = window.PortfolioPresetsData;
            }
            this.renderShowcase();
        },

        filterCategory: function(cat) {
            this.activeCategory = cat;
            document.querySelectorAll('#tbPortfolioCatTabs .tb-layout-cat-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.cat === cat);
            });
            this.renderShowcase();
        },

        onSearch: function(query) {
            this.searchQuery = (query || '').trim().toLowerCase();
            const clearBtn = document.getElementById('tbPortfolioSearchClear');
            if (clearBtn) clearBtn.style.display = this.searchQuery ? 'block' : 'none';
            this.renderShowcase();
        },

        clearSearch: function() {
            this.searchQuery = '';
            const input = document.getElementById('tbPortfolioSearchInput');
            if (input) input.value = '';
            const clearBtn = document.getElementById('tbPortfolioSearchClear');
            if (clearBtn) clearBtn.style.display = 'none';
            this.renderShowcase();
        },

        renderShowcase: function() {
            const grid = document.getElementById('tbPortfolioGrid');
            if (!grid) return;

            if ((!this.presets || this.presets.length === 0) && window.PortfolioPresetsData) {
                this.presets = window.PortfolioPresetsData;
            }

            let list = this.presets || [];
            if (this.activeCategory && this.activeCategory !== 'all') {
                list = list.filter(p => p.category === this.activeCategory);
            }
            if (this.searchQuery) {
                list = list.filter(p => p.name.toLowerCase().includes(this.searchQuery));
            }

            grid.innerHTML = '';
            if (list.length === 0) {
                grid.innerHTML = '<div style="grid-column: span 2; padding: 20px; text-align: center; color: #64748b; font-size: 11px;">Aradığınız kriterde şablon bulunamadı.</div>';
                return;
            }

            list.forEach(p => {
                const card = document.createElement('div');
                card.className = 'tb-portfolio-card';
                card.title = `${p.name} — ${p.ratio}`;
                card.onclick = () => this.applyPreset(p.id);

                // Thumbnail container
                const thumb = document.createElement('div');
                thumb.className = 'tb-portfolio-thumb';
                thumb.style.background = p.bg;

                // Miniature frames
                if (p.frames && Array.isArray(p.frames)) {
                    p.frames.forEach(f => {
                        const mini = document.createElement('div');
                        mini.className = 'tb-portfolio-mini-frame';
                        mini.style.left = (f.x * 100) + '%';
                        mini.style.top = (f.y * 100) + '%';
                        mini.style.width = (f.w * 100) + '%';
                        mini.style.height = (f.h * 100) + '%';
                        if (f.isCircle === 'true') mini.style.borderRadius = '50%';
                        thumb.appendChild(mini);
                    });
                }

                // Ratio tag
                const tag = document.createElement('span');
                tag.className = 'tb-portfolio-ratio-tag';
                tag.textContent = p.ratio;
                thumb.appendChild(tag);

                // Title & Meta
                const title = document.createElement('div');
                title.className = 'tb-portfolio-title';
                title.textContent = p.name;

                const meta = document.createElement('div');
                meta.className = 'tb-portfolio-meta';
                
                const frameCount = document.createElement('span');
                frameCount.textContent = `${(p.frames ? p.frames.length : 0)} Foto`;

                const price = document.createElement('span');
                price.className = 'tb-portfolio-price';
                const priceTextObj = (p.texts || []).find(t => t.type === 'price');
                price.textContent = priceTextObj ? priceTextObj.text.split(' ')[0] + ' ' + (priceTextObj.text.split(' ')[1] || '') : 'Vitrin';

                meta.appendChild(frameCount);
                meta.appendChild(price);

                card.appendChild(thumb);
                card.appendChild(title);
                card.appendChild(meta);

                grid.appendChild(card);
            });
        },

        applyPreset: function(presetId) {
            const p = (this.presets || []).find(item => item.id === presetId);
            if (!p) return;

            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                window.CanvasEmptyState.dismiss();
            }

            const cContainer = document.getElementById('canvas-container');
            const uiLayer = document.getElementById('ui-layer') || cContainer;
            if (!cContainer || !uiLayer) return;

            // 1. Tuval En-Boy Oranını Ayarla
            if (window.TemplateBuilder && typeof window.TemplateBuilder.setCanvasRatio === 'function') {
                window.TemplateBuilder.setCanvasRatio(p.ratio || '1:1');
            }

            // 2. Tuval Arka Planını Ayarla
            const isGrad = p.bg && (p.bg.includes('gradient') || p.bg.includes('linear') || p.bg.includes('radial'));
            if (window.TemplateBuilder && typeof window.TemplateBuilder.setCanvasBackground === 'function') {
                window.TemplateBuilder.setCanvasBackground(isGrad ? 'gradient' : 'color', p.bg, true);
            }

            // 3. Mevcut Çerçeveleri ve Özel Başlıkları Temizle
            document.querySelectorAll('.tb-image-frame, .tb-portfolio-text, .tb-layout-text').forEach(el => el.remove());

            const cW = parseFloat(cContainer.style.width) || cContainer.offsetWidth || 1920;
            const cH = parseFloat(cContainer.style.height) || cContainer.offsetHeight || 1080;

            // 4. Çerçeveleri Oluştur
            if (p.frames && Array.isArray(p.frames) && window.TemplateBuilder) {
                p.frames.forEach((f, idx) => {
                    const fw = Math.round(f.w * cW);
                    const fh = Math.round(f.h * cH);
                    const fx = Math.round(f.x * cW);
                    const fy = Math.round(f.y * cH);

                    window.TemplateBuilder.createImageFrame({
                        width: fw,
                        height: fh,
                        x: fx,
                        y: fy,
                        radius: f.radius !== undefined ? f.radius : 14,
                        shadow: f.shadow !== undefined ? f.shadow : 12,
                        shape: f.shape || 'none',
                        blend: f.blend || 'none',
                        isCircle: f.isCircle || 'false',
                        pitch: f.pitch || 0,
                        yaw: f.yaw || 0,
                        elevation: f.elevation || 0,
                        skipHistory: true
                    });
                });
            }

            // 5. Metin ve Rozet Elemanlarını Oluştur
            if (p.texts && Array.isArray(p.texts)) {
                p.texts.forEach(t => {
                    const textEl = document.createElement('div');
                    textEl.className = 'draggable canvas-el tb-portfolio-text';
                    textEl.style.position = 'absolute';
                    textEl.style.left = Math.round(t.x * cW) + 'px';
                    textEl.style.top = Math.round(t.y * cH) + 'px';
                    textEl.style.color = t.color || '#ffffff';
                    textEl.style.fontFamily = "'ClassicAmpersand', 'Inter', sans-serif";
                    textEl.style.fontWeight = t.fontWeight || (t.type === 'heading' ? '800' : '600');
                    textEl.style.fontSize = Math.round(t.fontSize * (cH / 1080)) + 'px';
                    textEl.style.zIndex = '300';
                    textEl.style.userSelect = 'none';

                    if (t.bg) {
                        textEl.style.backgroundColor = t.bg;
                        textEl.style.padding = '4px 10px';
                        textEl.style.borderRadius = '6px';
                        textEl.style.backdropFilter = 'blur(6px)';
                    }

                    textEl.textContent = t.text;
                    textEl.dataset.label = t.type === 'heading' ? 'Şablon Başlığı' : (t.type === 'price' ? 'Fiyat Etiketi' : 'Şablon Metni');

                    uiLayer.appendChild(textEl);

                    if (typeof window.bindDrag === 'function') {
                        window.bindDrag(textEl);
                    }
                    if (typeof window.enableInlineEdit === 'function') {
                        window.enableInlineEdit(textEl);
                    }
                });
            }

            // 6. Geçmişe Kaydet
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Hazır Portföy Şablonu: ' + p.name);
            }

            // 7. Katmanlar Panelini Güncelle
            if (typeof window.renderLayers === 'function') {
                window.renderLayers();
            }

            // İlk çerçeveyi seç
            const firstFrame = document.querySelector('.tb-image-frame');
            if (firstFrame && window.TemplateBuilder) {
                window.TemplateBuilder.selectFrame(firstFrame);
            }
        }
    };

    window.PortfolioManager = PortfolioManager;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PortfolioManager.init());
    } else {
        PortfolioManager.init();
    }

})(window);
