/**
 * ==========================================================================
 * EMLAK STÜDYOM - ÖZEL LOGO & ŞEFFAF ROZET (SVG / PNG) YÖNETİM MODÜLÜ
 * Standart: UI_DESIGN_SYSTEM.md | Modüler Mimari
 * ==========================================================================
 */

(function(window) {
    'use strict';

    const STORAGE_KEY = 'es_custom_badges_v1';

    const CustomBadges = {
        savedBadges: [],
        selectedBadgeEl: null,

        /**
         * Modülü Başlat
         */
        init: function() {
            this.loadSavedBadges();
            this.bindGlobalCanvasEvents();
            this.renderLibraryGrid();
        },

        /**
         * Kalıcı Kaydedilmiş Rozetleri Yükle (LocalStorage)
         * Not: Sadece kullanıcının açıkça "Kaydet" dediği (isPermanent: true) rozetler kalıcıdır.
         */
        loadSavedBadges: function() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const rawBadges = JSON.parse(stored) || [];
                    const unique = [];
                    const seenNames = new Set();
                    rawBadges.forEach(b => {
                        // Sadece açıkça isPermanent: true olanları kalıcı kütüphaneye al
                        if (b && b.isPermanent === true && b.name && !seenNames.has(b.name)) {
                            seenNames.add(b.name);
                            unique.push(b);
                        }
                    });
                    this.savedBadges = unique;
                    this.saveBadgesToStorage();
                } else {
                    this.savedBadges = [];
                }
            } catch (err) {
                console.warn('[CustomBadges] Rozetler yüklenemedi:', err);
                this.savedBadges = [];
            }
        },

        /**
         * Yalnızca Kalıcı Olarak Kaydedilmiş Rozetleri Depola
         */
        saveBadgesToStorage: function() {
            try {
                // Sadece isPermanent: true olan rozetleri sakla (son 24 adet)
                const permanentList = (this.savedBadges || []).filter(b => b && b.isPermanent === true).slice(0, 24);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(permanentList));
            } catch (err) {
                console.warn('[CustomBadges] Rozetler kaydedilemedi:', err);
            }
        },

        /**
         * Havuzdaki Tüm Rozetleri Temizle (Oturum + Kalıcı)
         */
        clearAllSavedBadges: function() {
            if (!this.savedBadges || this.savedBadges.length === 0) return;
            this.savedBadges = [];
            this.saveBadgesToStorage();
            this.renderLibraryGrid();
            const panel = document.getElementById('customBadgeSettingsPanel');
            if (panel) panel.style.display = 'none';
        },

        /**
         * Dosya Seçiciyi Tetikle
         */
        triggerUpload: function() {
            const input = document.getElementById('customBadgeFileInput');
            if (input) {
                input.value = '';
                input.click();
            }
        },

        /**
         * Yüklenen Dosyaları İşle (Çoklu SVG, PNG, WebP, JPG)
         */
        handleFileInput: async function(event) {
            const files = event && event.target && event.target.files ? Array.from(event.target.files) : [];
            if (!files || files.length === 0) return;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file.type.match(/image\/(png|svg\+xml|webp|jpeg|jpg)/i)) {
                    continue;
                }

                await this.processSingleFile(file);
            }

            this.renderLibraryGrid();
            if (event.target) event.target.value = '';

            // Rozetler sekmesine otomatik geç
            if (typeof window.switchTab === 'function') {
                window.switchTab('callout');
            }
        },

        /**
         * SVG Metnini Normalize Et: Eksik viewBox, xmlns veya Orantı Hatalarını Otomatik Düzelt
         */
        normalizeSvgString: function(svgText) {
            let cleanSvg = (svgText || '').trim();
            const svgTagMatch = cleanSvg.match(/<svg\b([^>]*)>/i);
            if (!svgTagMatch) return { text: cleanSvg, width: 200, height: 200, aspect: 1.0 };
            
            let attrs = svgTagMatch[1];
            let wMatch = attrs.match(/\bwidth=["']?([0-9.]+)(px|pt|em|rem)?["']?/i);
            let hMatch = attrs.match(/\bheight=["']?([0-9.]+)(px|pt|em|rem)?["']?/i);
            let vbMatch = attrs.match(/\bviewBox=["']?([^"']+)["']?/i);
            
            let w = wMatch ? parseFloat(wMatch[1]) : 0;
            let h = hMatch ? parseFloat(hMatch[1]) : 0;
            let vb = null;
            if (vbMatch) {
                vb = vbMatch[1].trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n));
            }
            
            let vbW = (vb && vb.length === 4 && vb[2] > 0) ? vb[2] : 0;
            let vbH = (vb && vb.length === 4 && vb[3] > 0) ? vb[3] : 0;
            
            let finalW = vbW || w || 200;
            let finalH = vbH || h || 200;
            let aspect = finalW / finalH;
            if (!aspect || isNaN(aspect) || aspect <= 0) aspect = 1.0;
            
            // 1. Standart SVG xmlns güvencesi (data-url ve tarayıcı render için)
            if (!/xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/i.test(attrs)) {
                cleanSvg = cleanSvg.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg" ');
            }
            
            // 2. viewBox eksikse ekle ki SVG her kapsayıcı boyutuna kusursuz ölçeklensin (asla devasa kırpılmasın)
            if (!vbMatch && (w > 0 && h > 0)) {
                cleanSvg = cleanSvg.replace(/<svg\b/i, `<svg viewBox="0 0 ${w} ${h}" `);
            }
            
            // 3. Orantı koruma güvencesi
            if (!/preserveAspectRatio=/i.test(attrs)) {
                cleanSvg = cleanSvg.replace(/<svg\b/i, '<svg preserveAspectRatio="xMidYMid meet" ');
            }
            
            return {
                text: cleanSvg,
                width: Math.round(finalW),
                height: Math.round(finalH),
                aspect: parseFloat(aspect.toFixed(4))
            };
        },

        /**
         * Standart Görsel Dosyası Oku (PNG, JPG, WebP)
         */
        _fallbackReadFile: function(file, cleanName) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const dataUrl = e.target.result;
                    const imgTest = new Image();
                    imgTest.onload = () => {
                        const nw = imgTest.naturalWidth || 200;
                        const nh = imgTest.naturalHeight || 200;
                        const badgeData = {
                            id: 'cbg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                            name: cleanName,
                            dataUrl: dataUrl,
                            naturalW: nw,
                            naturalH: nh,
                            aspect: parseFloat((nw / nh).toFixed(4)),
                            isPermanent: false
                        };
                        // Kütüphaneye ekle (mükerrer isimleri filtrele)
                        this.savedBadges = this.savedBadges.filter(b => b.name !== badgeData.name);
                        this.savedBadges.unshift(badgeData);
                        this.saveBadgesToStorage();
                        this.renderLibraryGrid();
                        this.addToCanvas(badgeData);
                        resolve();
                    };
                    imgTest.onerror = () => resolve();
                    imgTest.src = dataUrl;
                };
                reader.onerror = () => resolve();
                reader.readAsDataURL(file);
            });
        },

        /**
         * Tek Bir Görseli Oku ve Tuvale Ekle
         */
        processSingleFile: function(file) {
            return new Promise((resolve) => {
                const cleanName = (file.name || 'Özel Rozet').replace(/\.[^/.]+$/, '');
                const isSvg = (file.type && file.type.includes('svg')) || (file.name && file.name.toLowerCase().endsWith('.svg'));

                if (isSvg && typeof file.text === 'function') {
                    file.text().then(svgText => {
                        const norm = this.normalizeSvgString(svgText);
                        const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(norm.text);

                        const badgeData = {
                            id: 'cbg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                            name: cleanName,
                            dataUrl: dataUrl,
                            naturalW: norm.width,
                            naturalH: norm.height,
                            aspect: norm.aspect,
                            isPermanent: false
                        };

                        // Kütüphaneye ekle (mükerrer isimleri filtrele)
                        this.savedBadges = this.savedBadges.filter(b => b.name !== badgeData.name);
                        this.savedBadges.unshift(badgeData);
                        this.saveBadgesToStorage();
                        this.renderLibraryGrid();
                        this.addToCanvas(badgeData);
                        resolve();
                    }).catch(() => {
                        this._fallbackReadFile(file, cleanName).then(resolve);
                    });
                } else {
                    this._fallbackReadFile(file, cleanName).then(resolve);
                }
            });
        },

        /**
         * Tuvale Rozet / Logo Ekle
         */
        addToCanvas: function(badgeData, opts = {}) {
            const container = document.getElementById('canvas-container') || document.getElementById('workArea');
            if (!container) return;

            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                window.CanvasEmptyState.dismiss();
            }

            const cW = container.offsetWidth || 1920;
            const cH = container.offsetHeight || 1080;

            // Boyutlandırma: Görselin en-boy oranını koru
            const natW = badgeData.naturalW || 200;
            const natH = badgeData.naturalH || 200;
            let aspect = badgeData.aspect || (natW / natH);
            if (!aspect || isNaN(aspect) || aspect <= 0) aspect = 1.0;

            let targetW = opts.width || 180;
            let targetH = Math.round(targetW / aspect);
            if (targetH > 220) {
                targetH = 220;
                targetW = Math.round(targetH * aspect);
            }
            if (targetW > Math.min(800, cW * 0.8)) {
                targetW = Math.round(Math.min(800, cW * 0.8));
                targetH = Math.max(10, Math.round(targetW / aspect));
            }

            // Konum: Tuvalin ortası + kademeli kaydırma
            const count = document.querySelectorAll('.custom-graphic-badge').length;
            const offsetX = (count % 5) * 20;
            const offsetY = (count % 5) * 20;
            const left = opts.left !== undefined ? opts.left : Math.round((cW - targetW) / 2) + offsetX;
            const top = opts.top !== undefined ? opts.top : Math.round((cH - targetH) / 2) + offsetY;

            const wrap = document.createElement('div');
            wrap.id = 'badge_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
            wrap.className = 'draggable canvas-el custom-graphic-badge';
            wrap.dataset.layerUid = wrap.id;
            wrap.dataset.label = badgeData.name || 'Özel Rozet';
            wrap.dataset.badgeType = 'custom-badge';
            wrap.dataset.badgeDataUrl = badgeData.dataUrl;
            wrap.dataset.naturalW = natW;
            wrap.dataset.naturalH = natH;
            wrap.dataset.aspectRatio = aspect.toFixed(4);

            // Ayar parametreleri (Önemli: ölçek çarpanı daima 1 olarak başlar, asla 100 olamaz!)
            wrap.dataset.scale = opts.scale ? String(opts.scale) : '1';
            wrap.dataset.rotation = opts.rotation || 0;
            wrap.dataset.opacity = opts.opacity || 100;
            wrap.dataset.shadow = opts.shadow || 0;
            wrap.dataset.margin = opts.margin || 24;
            wrap.dataset.neon = opts.neon ? 'true' : 'false';
            wrap.dataset.neonColor = opts.neonColor || '#00f0ff';
            wrap.dataset.neonSize = opts.neonSize || 25;
            wrap.dataset.neonIntensity = opts.neonIntensity || 2.5;
            wrap.dataset.flippedH = opts.flippedH ? 'true' : 'false';

            wrap.style.cssText = `
                position: absolute;
                left: ${left}px;
                top: ${top}px;
                width: ${targetW}px;
                height: ${targetH}px;
                z-index: 500;
                cursor: move;
                user-select: none;
                line-height: 0;
            `;

            wrap.innerHTML = `
                <div class="custom-badge-content">
                    <img src="${badgeData.dataUrl}" class="custom-badge-img" alt="${badgeData.name}">
                </div>
            `;

            container.appendChild(wrap);

            // Sürükleme ve seçim olaylarını bağla
            if (typeof window.bindDrag === 'function') {
                window.bindDrag(wrap);
            }

            wrap.addEventListener('mousedown', (e) => {
                if (e.button === 0) {
                    this.selectBadge(wrap);
                }
            });

            this.applyBadgeStyles(wrap);
            this.selectBadge(wrap);

            if (typeof window.renderLayers === 'function') window.renderLayers();
            if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
            if (typeof window.recordHistory === 'function') window.recordHistory('Rozet Eklendi');
        },

        /**
         * Tuvaldeki Bir Rozeti Seç
         */
        selectBadge: function(badgeEl) {
            if (!badgeEl || !badgeEl.classList.contains('custom-graphic-badge')) return;

            document.querySelectorAll('.custom-graphic-badge').forEach(b => b.classList.remove('el-selected'));
            badgeEl.classList.add('el-selected');
            this.selectedBadgeEl = badgeEl;

            // Hazır rozet (callout) şablon ayarlarını ve seçimlerini tamamen gizle/kapat
            const calloutPanel = document.getElementById('calloutSettingsPanel');
            if (calloutPanel) {
                calloutPanel.style.display = 'none';
                calloutPanel.open = false;
            }
            if (typeof window.closeCalloutPanel === 'function') {
                window.closeCalloutPanel();
            }
            document.querySelectorAll('.callout-wrap, .callout-item, .svg-callout, .co-neon-block').forEach(c => {
                c.classList.remove('el-selected');
                if (c.style) c.style.outline = 'none';
            });
            document.querySelectorAll('.callout-controls, .callout-resizer, .callout-rotator, .callout-select-border, .callout-handle-width, .callout-handle-length').forEach(c => {
                c.style.display = 'none';
            });

            // Paneli aç ve değerleri senkronize et
            const panel = document.getElementById('customBadgeSettingsPanel');
            if (panel) {
                panel.style.display = 'block';
                const title = document.getElementById('cbgPanelTitleText');
                if (title) title.innerHTML = '<i class="fa-solid fa-sliders" style="color:#0284c7; margin-right:4px;"></i>' + (badgeEl.dataset.label || 'Özel Rozet');

                // Kaydet buton durumunu senkronize et
                this.updatePanelSaveBtnState();

                // Sliderları güncelle
                const w = parseInt(badgeEl.style.width) || 180;
                this._setSliderVal('cbgSizeSlider', 'cbgSizeVal', w, 'px');
                this._setSliderVal('cbgOpacitySlider', 'cbgOpacityVal', parseInt(badgeEl.dataset.opacity || 100), '%');
                this._setSliderVal('cbgRotateSlider', 'cbgRotateVal', parseInt(badgeEl.dataset.rotation || 0), '°');
                this._setSliderVal('cbgMarginSlider', 'cbgMarginVal', parseInt(badgeEl.dataset.margin || 24), 'px');
                this._setSliderVal('cbgShadowSlider', 'cbgShadowVal', parseInt(badgeEl.dataset.shadow || 0), 'px');

                // Neon kontrolleri
                const isNeon = badgeEl.dataset.neon === 'true';
                const neonBox = document.getElementById('cbgNeonControls');
                const neonBtn = document.getElementById('btnToggleCbgNeonText');
                if (neonBox) neonBox.style.display = isNeon ? 'flex' : 'none';
                if (neonBtn) neonBtn.textContent = isNeon ? 'Neon Kapat' : 'Neon Aç';

                const neonCol = document.getElementById('cbgNeonColorInput');
                if (neonCol) neonCol.value = badgeEl.dataset.neonColor || '#00f0ff';

                this._setSliderVal('cbgNeonPowerSlider', 'cbgNeonPowerVal', parseInt(badgeEl.dataset.neonSize || 25), 'px');
                this._setSliderVal('cbgNeonIntensitySlider', 'cbgNeonIntensityVal', parseFloat(badgeEl.dataset.neonIntensity || 2.5), 'x');

                // Rozet renk paletini ve düzenleyicisini yükle
                this.renderColorSwapperUI(badgeEl);
            }

            // Rozetler sekmesine odaklan
            if (typeof window.switchTab === 'function') {
                const activeTab = document.querySelector('#mainTabs .tab-btn.active');
                if (activeTab && activeTab.dataset.tab !== 'callout') {
                    window.switchTab('callout');
                }
            }
        },

        /**
         * SVG DataURL'den SVG Metnini Çöz (Decode)
         */
        decodeSvgText: function(dataUrl) {
            if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.includes('image/svg+xml')) return null;
            try {
                if (dataUrl.includes('base64,')) {
                    const b64 = dataUrl.split('base64,')[1];
                    return decodeURIComponent(escape(atob(b64)));
                } else {
                    const parts = dataUrl.split(',');
                    if (parts.length > 1) {
                        return decodeURIComponent(parts.slice(1).join(','));
                    }
                }
            } catch(e) {
                console.warn('[CustomBadges] SVG decode hatası:', e);
            }
            return null;
        },

        /**
         * Renk Metnini Standart 6 Haneli Hex Koduna Çevir
         */
        normalizeToHex: function(str) {
            if (!str) return null;
            str = str.trim().toLowerCase();
            if (str.startsWith('#')) {
                let c = str.substring(1);
                if (c.length === 3) c = c.split('').map(x => x + x).join('');
                if (c.length === 6) return '#' + c;
            }
            const match = str.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
            if (match) {
                const r = parseInt(match[1]).toString(16).padStart(2, '0');
                const g = parseInt(match[2]).toString(16).padStart(2, '0');
                const b = parseInt(match[3]).toString(16).padStart(2, '0');
                return '#' + r + g + b;
            }
            if (str === 'white') return '#ffffff';
            if (str === 'black') return '#000000';
            if (str === 'red') return '#ef4444';
            if (str === 'blue') return '#0284c7';
            if (str === 'yellow') return '#facc15';
            return null;
        },

        /**
         * Hex Rengin Parlaklık Değerini Hesapla (0 = Siyah, 1 = Beyaz)
         */
        getColorLuminance: function(hex) {
            const h = this.normalizeToHex(hex);
            if (!h) return 0.5;
            const num = parseInt(h.substring(1), 16);
            const r = (num >> 16) & 255;
            const g = (num >> 8) & 255;
            const b = num & 255;
            return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        },

        /**
         * SVG İçindeki Benzersiz Renkleri Ayıkla
         */
        extractSvgColors: function(svgText) {
            if (!svgText) return [];
            const foundHexes = new Set();
            
            // 1. fill="..." veya stroke="..."
            const attrRegex = /\b(?:fill|stroke)\s*=\s*["']([^"']+)["']/gi;
            let m;
            while ((m = attrRegex.exec(svgText)) !== null) {
                const v = m[1].trim();
                if (v && v !== 'none' && v !== 'transparent' && v !== 'currentColor' && !v.startsWith('url(')) {
                    const h = this.normalizeToHex(v);
                    if (h) foundHexes.add(h);
                }
            }

            // 2. style="..." içi
            const styleRegex = /(?:fill|stroke)\s*:\s*([^;\"'}\s]+)/gi;
            while ((m = styleRegex.exec(svgText)) !== null) {
                const v = m[1].trim();
                if (v && v !== 'none' && v !== 'transparent' && v !== 'currentColor' && !v.startsWith('url(')) {
                    const h = this.normalizeToHex(v);
                    if (h) foundHexes.add(h);
                }
            }

            // 3. stop-color="..."
            const stopRegex = /\bstop-color\s*=\s*["']([^"']+)["']/gi;
            while ((m = stopRegex.exec(svgText)) !== null) {
                const v = m[1].trim();
                if (v && v !== 'none' && v !== 'transparent') {
                    const h = this.normalizeToHex(v);
                    if (h) foundHexes.add(h);
                }
            }

            return Array.from(foundHexes);
        },

        /**
         * SVG İçinde Belirli Bir Rengi Başka Bir Renkle Değiştir
         */
        replaceSvgColor: function(svgText, oldColor, newColor) {
            if (!svgText || !oldColor || !newColor) return svgText;
            const normOld = this.normalizeToHex(oldColor) || oldColor;
            const normNew = this.normalizeToHex(newColor) || newColor;

            // 3 haneli kısa eşleşmeyi de yakalamak için
            let shortOld = null;
            if (normOld.startsWith('#') && normOld.length === 7 && normOld[1] === normOld[2] && normOld[3] === normOld[4] && normOld[5] === normOld[6]) {
                shortOld = '#' + normOld[1] + normOld[3] + normOld[5];
            }

            const targets = [normOld];
            if (shortOld) targets.push(shortOld);
            if (oldColor.toLowerCase() !== normOld) targets.push(oldColor);

            let result = svgText;
            targets.forEach(t => {
                const esc = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(?<=(?:fill|stroke|stop-color)\\s*[:=]\\s*["']?)${esc}(?=["';\\s}])`, 'gi');
                result = result.replace(regex, normNew);
                const directRegex = new RegExp(`(["':;\\s])${esc}(["';\\s])`, 'gi');
                result = result.replace(directRegex, `$1${normNew}$2`);
            });
            return result;
        },

        _getTargetBadges: function() {
            const isBadge = (e) => e && e.classList && e.classList.contains('custom-graphic-badge') && document.body.contains(e);
            if (typeof window.getMultiSelectTargets === 'function') {
                const list = window.getMultiSelectTargets(isBadge, isBadge(this.selectedBadgeEl) ? this.selectedBadgeEl : null);
                if (list.length) return list;
            }
            return isBadge(this.selectedBadgeEl) ? [this.selectedBadgeEl] : [];
        },

        /**
         * Bir Rozet Elemanındaki Tek Bir Rengi Değiştir
         */
        recolorSingleColor: function(badgeEl, oldColor, newColor) {
            const targets = (!badgeEl || badgeEl === this.selectedBadgeEl)
                ? this._getTargetBadges()
                : [badgeEl];
            if (!targets.length) return;

            targets.forEach(el => {
                const curUrl = el.dataset.badgeDataUrl;
                const svgText = this.decodeSvgText(curUrl);
                if (!svgText) return;

                const updatedSvg = this.replaceSvgColor(svgText, oldColor, newColor);
                const newDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(updatedSvg);

                el.dataset.badgeDataUrl = newDataUrl;
                const img = el.querySelector('.custom-badge-img');
                if (img) img.src = newDataUrl;
            });

            this.renderColorSwapperUI(this.selectedBadgeEl || targets[0]);
            if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
            if (typeof window.recordHistory === 'function') window.recordHistory('Rozet Rengi Değiştirildi');
        },

        /**
         * SVG Rozete Şablon Renklerini Uygula (PRO Renk Paleti Eşleştirici için)
         */
        recolorSvgBadge: function(badgeEl, { bgCol, acCol, txtCol }) {
            if (!badgeEl) badgeEl = this.selectedBadgeEl;
            if (!badgeEl) return;

            const curUrl = badgeEl.dataset.badgeDataUrl;
            const svgText = this.decodeSvgText(curUrl);
            if (!svgText) return;

            const detected = this.extractSvgColors(svgText);
            if (detected.length === 0) return;

            let updatedSvg = svgText;
            detected.forEach(col => {
                const lum = this.getColorLuminance(col);
                if (lum > 0.75 && txtCol) {
                    // Açık tonlar -> Yazı / Kontur Rengi
                    updatedSvg = this.replaceSvgColor(updatedSvg, col, txtCol);
                } else if (lum < 0.22 && bgCol) {
                    // Koyu tonlar -> Zemin Rengi
                    updatedSvg = this.replaceSvgColor(updatedSvg, col, bgCol);
                } else if (acCol) {
                    // Ara / Renkli tonlar -> Vurgu Rengi
                    updatedSvg = this.replaceSvgColor(updatedSvg, col, acCol);
                }
            });

            const newDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(updatedSvg);
            badgeEl.dataset.badgeDataUrl = newDataUrl;
            const img = badgeEl.querySelector('.custom-badge-img');
            if (img) img.src = newDataUrl;

            if (this.selectedBadgeEl === badgeEl) {
                this.renderColorSwapperUI(badgeEl);
            }
            if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
            if (typeof window.recordHistory === 'function') window.recordHistory('Rozet Şablon Rengine Eşleştirildi');
        },

        /**
         * Hızlı Hazır Renk Teması Uygula
         */
        applyQuickTheme: function(themeKey) {
            const targets = this._getTargetBadges();
            if (!targets.length) return;

            const themes = {
                gold: { acCol: '#eab308', txtCol: '#ffffff' },
                cyan: { acCol: '#00f0ff', txtCol: '#ffffff' },
                emerald: { acCol: '#10b981', txtCol: '#ffffff' },
                crimson: { acCol: '#ef4444', txtCol: '#ffffff' },
                white: { acCol: '#ffffff', txtCol: '#ffffff', bgCol: '#0f172a' }
            };

            const t = themes[themeKey];
            if (t) {
                targets.forEach(el => this.recolorSvgBadge(el, t));
            }
        },

        /**
         * Rozet Ayar Panelindeki Renk Değiştirici UI'ını Güncelle
         */
        renderColorSwapperUI: function(badgeEl) {
            const section = document.getElementById('cbgColorsSection');
            const grid = document.getElementById('cbgSvgColorsGrid');
            if (!section || !grid) return;

            if (!badgeEl || !badgeEl.dataset.badgeDataUrl) {
                section.style.display = 'none';
                return;
            }

            const dataUrl = badgeEl.dataset.badgeDataUrl;
            const svgText = this.decodeSvgText(dataUrl);

            // Eğer SVG değilse (PNG / JPG) renk değiştiriciyi zarifçe gizle
            if (!svgText) {
                section.style.display = 'none';
                return;
            }

            const colors = this.extractSvgColors(svgText);
            if (colors.length === 0) {
                section.style.display = 'none';
                return;
            }

            section.style.display = 'block';
            grid.innerHTML = colors.map((col) => `
                <div class="cbg-color-swatch-wrap" style="background:${col};" title="Rengi Değiştir: ${col}">
                    <input type="color" class="cbg-color-swatch-input" value="${col}" onchange="CustomBadges.recolorSingleColor(CustomBadges.selectedBadgeEl, '${col}', this.value)" oninput="CustomBadges.recolorSingleColor(CustomBadges.selectedBadgeEl, '${col}', this.value)">
                </div>
            `).join('');
        },

        _setSliderVal: function(sliderId, labelId, val, unit = '') {
            const s = document.getElementById(sliderId);
            const l = document.getElementById(labelId);
            if (s) s.value = val;
            if (l) l.textContent = val + unit;
        },

        /**
         * Panelden Gelen Değerleri Seçili Rozete Uygula
         */
        updateSelectedBadge: function() {
            const targets = this._getTargetBadges();
            if (!targets.length) return;

            const sizeSlider = document.getElementById('cbgSizeSlider');
            const opSlider = document.getElementById('cbgOpacitySlider');
            const rotSlider = document.getElementById('cbgRotateSlider');
            const marginSlider = document.getElementById('cbgMarginSlider');
            const shSlider = document.getElementById('cbgShadowSlider');
            const neonPow = document.getElementById('cbgNeonPowerSlider');
            const neonCol = document.getElementById('cbgNeonColorInput');
            const neonInt = document.getElementById('cbgNeonIntensitySlider');

            targets.forEach(el => {
                if (sizeSlider) {
                    const targetW = Math.max(20, Math.min(1920, parseInt(sizeSlider.value) || 180));
                    let aspect = parseFloat(el.dataset.aspectRatio);
                    if (!aspect || isNaN(aspect) || aspect <= 0) aspect = 1.0;
                    const targetH = Math.max(10, Math.round(targetW / aspect));
                    el.style.width = targetW + 'px';
                    el.style.height = targetH + 'px';
                }
                if (opSlider) el.dataset.opacity = opSlider.value;
                if (rotSlider) el.dataset.rotation = rotSlider.value;
                if (marginSlider) el.dataset.margin = marginSlider.value;
                if (shSlider) el.dataset.shadow = shSlider.value;
                if (neonPow) el.dataset.neonSize = neonPow.value;
                if (neonCol) el.dataset.neonColor = neonCol.value;
                if (neonInt) el.dataset.neonIntensity = neonInt.value;

                this.applyBadgeStyles(el);
            });

            if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
        },

        /**
         * CSS Filtrelerini ve Transform'u Hesapla & Uygula
         */
        applyBadgeStyles: function(el) {
            if (!el) return;
            const img = el.querySelector('.custom-badge-img');
            const content = el.querySelector('.custom-badge-content');
            if (!img || !content) return;

            const opacity = (parseInt(el.dataset.opacity || 100)) / 100;
            const rotation = parseInt(el.dataset.rotation || 0);
            const flippedH = el.dataset.flippedH === 'true';
            const shadow = parseInt(el.dataset.shadow || 0);
            const isNeon = el.dataset.neon === 'true';
            const scale = parseFloat(el.dataset.scale) || 1.0;

            // Opaklık
            el.style.opacity = opacity.toString();

            // Transform: Döndürme ve tuval ölçeği el üzerinde, yatay aynalama content üzerinde
            el.style.transform = `rotate(${rotation}deg) scale(${scale})`;
            content.style.transform = `scaleX(${flippedH ? -1 : 1})`;

            // Çok Katmanlı Filtre (Gölge + Neon)
            const filters = [];

            // 1. Zemin Yumuşak Alt Gölge
            if (shadow > 0) {
                filters.push(`drop-shadow(0 ${Math.round(shadow * 0.35)}px ${shadow}px rgba(0, 0, 0, 0.65))`);
            }

            // 2. Neon Işıma Filtreleri (Şeffaf Hat Boyunca)
            if (isNeon) {
                const neonColor = el.dataset.neonColor || '#00f0ff';
                const neonSize = parseInt(el.dataset.neonSize || 25);
                const intensity = parseFloat(el.dataset.neonIntensity || 2.5);

                const blurCore = Math.max(1, Math.round(neonSize * 0.15));
                const blurMid = Math.max(2, Math.round(neonSize * 0.5));
                const blurOuter = Math.max(4, neonSize);

                filters.push(`drop-shadow(0 0 ${blurCore}px ${neonColor})`);
                filters.push(`drop-shadow(0 0 ${blurMid}px ${neonColor})`);
                filters.push(`drop-shadow(0 0 ${blurOuter}px ${neonColor})`);

                if (intensity > 2.5) {
                    filters.push(`brightness(${Math.min(1.8, 1 + (intensity - 2.5) * 0.3).toFixed(2)})`);
                }
            }

            img.style.filter = filters.length > 0 ? filters.join(' ') : 'none';
        },

        /**
         * Neon Efektini Aç / Kapat
         */
        toggleNeon: function() {
            const targets = this._getTargetBadges();
            if (!targets.length) return;

            const primary = this.selectedBadgeEl || targets[0];
            const currentlyActive = primary.dataset.neon === 'true';
            const nextState = !currentlyActive;

            targets.forEach(el => {
                el.dataset.neon = nextState ? 'true' : 'false';
                this.applyBadgeStyles(el);
            });

            const neonBox = document.getElementById('cbgNeonControls');
            const neonBtn = document.getElementById('btnToggleCbgNeonText');
            if (neonBox) neonBox.style.display = nextState ? 'flex' : 'none';
            if (neonBtn) neonBtn.textContent = nextState ? 'Neon Kapat' : 'Neon Aç';

            if (typeof window.recordHistory === 'function') window.recordHistory('Rozet Neon Değiştirildi');
        },

        /**
         * 9-Nokta Akıllı Çıpa Hizalama
         */
        anchorSelectedBadge: function(posKey) {
            const targets = this._getTargetBadges();
            const container = document.getElementById('canvas-container') || document.getElementById('workArea');
            if (!targets.length || !container) return;

            const cW = container.offsetWidth || 1920;
            const cH = container.offsetHeight || 1080;

            targets.forEach(el => {
                const bW = el.offsetWidth || 180;
                const bH = el.offsetHeight || 180;
                const m = parseInt(el.dataset.margin || 24);

                let newX = m;
                let newY = m;

                switch (posKey) {
                    case 'top-left':
                        newX = m; newY = m;
                        break;
                    case 'top-center':
                        newX = Math.round((cW - bW) / 2); newY = m;
                        break;
                    case 'top-right':
                        newX = cW - bW - m; newY = m;
                        break;
                    case 'middle-left':
                        newX = m; newY = Math.round((cH - bH) / 2);
                        break;
                    case 'center':
                        newX = Math.round((cW - bW) / 2); newY = Math.round((cH - bH) / 2);
                        break;
                    case 'middle-right':
                        newX = cW - bW - m; newY = Math.round((cH - bH) / 2);
                        break;
                    case 'bottom-left':
                        newX = m; newY = cH - bH - m;
                        break;
                    case 'bottom-center':
                        newX = Math.round((cW - bW) / 2); newY = cH - bH - m;
                        break;
                    case 'bottom-right':
                        newX = cW - bW - m; newY = cH - bH - m;
                        break;
                }

                el.style.left = `${Math.max(0, newX)}px`;
                el.style.top = `${Math.max(0, newY)}px`;
            });

            // Aktif buton görselini güncelle
            document.querySelectorAll('.custom-badge-anchor-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.pos === posKey);
            });

            if (typeof window.recordHistory === 'function') window.recordHistory('Rozet Hizalandı');
        },

        /**
         * Yatay Aynala (Flip)
         */
        flipHorizontal: function() {
            const targets = this._getTargetBadges();
            if (!targets.length) return;
            const primary = this.selectedBadgeEl || targets[0];
            const isFlipped = primary.dataset.flippedH === 'true';
            const nextVal = isFlipped ? 'false' : 'true';
            targets.forEach(el => {
                el.dataset.flippedH = nextVal;
                this.applyBadgeStyles(el);
            });
            if (typeof window.recordHistory === 'function') window.recordHistory('Rozet Aynalandı');
        },

        /**
         * Açı ve Boyutu Sıfırla
         */
        resetToDefault: function() {
            const targets = this._getTargetBadges();
            if (!targets.length) return;

            targets.forEach(el => {
                el.dataset.rotation = '0';
                el.dataset.scale = '1';
                el.dataset.flippedH = 'false';
                el.dataset.opacity = '100';
                el.dataset.shadow = '0';
                el.style.width = '180px';
                let aspect = parseFloat(el.dataset.aspectRatio) || 1.0;
                if (!aspect || isNaN(aspect) || aspect <= 0) aspect = 1.0;
                el.style.height = Math.round(180 / aspect) + 'px';
                el.style.transform = 'rotate(0deg) scale(1)';

                const content = el.querySelector('.custom-badge-content');
                if (content) content.style.transform = 'scaleX(1)';

                this.applyBadgeStyles(el);
            });

            if (targets.length === 1) {
                this.selectBadge(targets[0]);
            }
            if (typeof window.recordHistory === 'function') window.recordHistory('Rozet Sıfırlandı');
        },

        /**
         * Katman Sırası: En Öne Al
         */
        bringToFront: function() {
            const targets = this._getTargetBadges();
            if (!targets.length) return;
            targets.forEach(el => {
                if (el.parentElement) el.parentElement.appendChild(el);
            });
            if (typeof window.renderLayers === 'function') window.renderLayers();
            if (typeof window.recordHistory === 'function') window.recordHistory('Rozet Öne Alındı');
        },

        /**
         * Katman Sırası: En Arkaya Gönder
         */
        sendToBack: function() {
            const targets = this._getTargetBadges();
            if (!targets.length) return;
            for (let i = targets.length - 1; i >= 0; i--) {
                const el = targets[i];
                if (el.parentElement && el.parentElement.firstChild) {
                    el.parentElement.insertBefore(el, el.parentElement.firstChild);
                }
            }
            if (typeof window.renderLayers === 'function') window.renderLayers();
            if (typeof window.recordHistory === 'function') window.recordHistory('Rozet Arkaya Gönderildi');
        },

        /**
         * Katmanı Kilitle / Kilidi Aç
         */
        toggleLock: function() {
            const targets = this._getTargetBadges();
            if (!targets.length) return;
            const primary = this.selectedBadgeEl || targets[0];
            const nextLocked = !(primary.dataset.locked === 'true');
            targets.forEach(el => {
                el.dataset.locked = nextLocked ? 'true' : 'false';
                el.style.pointerEvents = nextLocked ? 'none' : 'auto';
            });
            if (typeof window.renderLayers === 'function') window.renderLayers();
        },

        /**
         * Seçili Rozeti Çoğalt
         */
        duplicateBadge: function() {
            const targets = this._getTargetBadges();
            if (!targets.length) return;

            targets.forEach((el, idx) => {
                const badgeData = {
                    id: 'cbg_' + Date.now() + '_' + idx,
                    name: (el.dataset.label || 'Rozet') + ' (Kopya)',
                    dataUrl: el.dataset.badgeDataUrl,
                    naturalW: parseInt(el.dataset.naturalW || 200),
                    naturalH: parseInt(el.dataset.naturalH || 200)
                };

                const curLeft = parseInt(el.style.left) || 50;
                const curTop = parseInt(el.style.top) || 50;

                this.addToCanvas(badgeData, {
                    left: curLeft + 24,
                    top: curTop + 24,
                    scale: el.dataset.scale,
                    rotation: el.dataset.rotation,
                    opacity: el.dataset.opacity,
                    shadow: el.dataset.shadow,
                    margin: el.dataset.margin,
                    neon: el.dataset.neon === 'true',
                    neonColor: el.dataset.neonColor,
                    neonSize: el.dataset.neonSize,
                    neonIntensity: el.dataset.neonIntensity,
                    flippedH: el.dataset.flippedH === 'true'
                });
            });
        },

        /**
         * Seçili Rozeti Tuvalden Sil
         */
        deleteSelectedBadge: function() {
            const targets = this._getTargetBadges();
            if (!targets.length) return;

            targets.forEach(el => el.remove());
            this.selectedBadgeEl = null;
            if (window.selectedElements) window.selectedElements = [];

            const panel = document.getElementById('customBadgeSettingsPanel');
            if (panel) panel.style.display = 'none';

            if (typeof window.updateMultiSelectUI === 'function') window.updateMultiSelectUI();
            if (typeof window.renderLayers === 'function') window.renderLayers();
            if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
            if (typeof window.recordHistory === 'function') window.recordHistory('Rozet Silindi');
        },

        /**
         * Oturum Rozet Kütüphanesinden Rozeti Kaldır
         */
        removeSavedBadge: function(badgeId, e) {
            if (e) e.stopPropagation();
            this.savedBadges = this.savedBadges.filter(b => b.id !== badgeId);
            this.saveBadgesToStorage();
            this.renderLibraryGrid();
        },

        /**
         * Rozeti Kalıcı Kütüphaneye Kaydet (LocalStorage)
         */
        saveBadgePermanent: function(badgeId, e) {
            if (e) e.stopPropagation();
            const badge = (this.savedBadges || []).find(b => b.id === badgeId);
            if (!badge) return;
            badge.isPermanent = true;
            this.saveBadgesToStorage();
            this.renderLibraryGrid();
            this.updatePanelSaveBtnState();
            if (typeof window.showAppToast === 'function') {
                window.showAppToast('Rozet kalıcı kütüphaneye kaydedildi', 'success', 2500);
            }
        },

        /**
         * Tuvalde Seçili Rozeti Kalıcı Kaydet
         */
        saveSelectedBadgePermanent: function() {
            const el = this.selectedBadgeEl;
            if (!el) return;
            const dataUrl = el.dataset.badgeDataUrl;
            const badge = (this.savedBadges || []).find(b => b.dataUrl === dataUrl || b.name === el.dataset.label);
            if (badge) {
                this.saveBadgePermanent(badge.id);
            }
        },

        /**
         * Ayar Panelindeki Kaydet Butonunun Durumunu Güncelle
         */
        updatePanelSaveBtnState: function() {
            const btn = document.getElementById('cbgSavePermanentBtn');
            if (!btn) return;
            const el = this.selectedBadgeEl;
            if (!el) {
                btn.style.display = 'none';
                return;
            }
            btn.style.display = 'inline-flex';
            const dataUrl = el.dataset.badgeDataUrl;
            const badge = (this.savedBadges || []).find(b => b.dataUrl === dataUrl || b.name === el.dataset.label);
            if (badge && badge.isPermanent === true) {
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Kayıtlı';
                btn.title = 'Bu rozet kalıcı kütüphanede kayıtlıdır';
                btn.disabled = true;
                btn.style.opacity = '0.85';
                btn.style.cursor = 'default';
            } else {
                btn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Kaydet';
                btn.title = 'Sayfa yenilenince silinmemesi için kalıcı kütüphaneye kaydet';
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        },

        /**
         * Sayfa Temizlendiğinde Çalışma Alanını ve Geçici Rozetleri Sıfırla
         */
        resetWorkspaceBadges: function() {
            // 1. Tuvaldeki tüm özel rozetleri kaldır
            const container = document.getElementById('canvas-container') || document.getElementById('workArea');
            if (container) {
                const badges = container.querySelectorAll('.custom-graphic-badge');
                badges.forEach(b => b.remove());
            }
            this.selectedBadgeEl = null;

            // 2. Ayar panelini gizle
            const panel = document.getElementById('customBadgeSettingsPanel');
            if (panel) panel.style.display = 'none';

            // 3. Kalıcı kaydedilmemiş geçici rozetleri havuzdan temizle
            this.savedBadges = (this.savedBadges || []).filter(b => b.isPermanent === true);
            this.saveBadgesToStorage();
            this.renderLibraryGrid();
        },

        /**
         * Oturum Rozet Kütüphanesini Ekrana Çiz
         */
        renderLibraryGrid: function() {
            const grid = document.getElementById('customBadgeSessionGrid');
            if (!grid) return;

            if (this.savedBadges.length === 0) {
                grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:10px; font-size:11px; color:#94a3b8;">Henüz yüklenmiş özel rozet yok.</div>';
                return;
            }

            grid.innerHTML = this.savedBadges.map(badge => {
                const isPerm = badge.isPermanent === true;
                const saveTag = isPerm
                    ? `<span class="custom-badge-saved-tag" title="Kalıcı Kütüphanede Kayıtlı"><i class="fa-solid fa-bookmark"></i></span>`
                    : `<button type="button" class="custom-badge-card-save-btn" onclick="CustomBadges.saveBadgePermanent('${badge.id}', event)" title="Kalıcı Kütüphaneye Kaydet"><i class="fa-regular fa-bookmark"></i></button>`;

                return `
                    <div class="custom-badge-thumb-card" onclick="CustomBadges.addToCanvas(CustomBadges.savedBadges.find(b=>b.id==='${badge.id}'))" title="Tuvale Ekle: ${badge.name}">
                        ${saveTag}
                        <img src="${badge.dataUrl}" class="custom-badge-thumb-img" alt="${badge.name}">
                        <button type="button" class="custom-badge-delete-btn" onclick="CustomBadges.removeSavedBadge('${badge.id}', event)" title="Kütüphaneden Sil">✕</button>
                    </div>
                `;
            }).join('');
        },

        /**
         * Seçili Rozeti Görsel Havuzundaki (Staging) Tüm Fotoğraflara Uygula
         */
        applySelectedBadgeToAllStagingPhotos: async function() {
            const el = this.selectedBadgeEl;
            if (!el || !window.PhotoStagingArchive) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Lütfen önce tuvalde bir rozet seçin.', 'warning');
                }
                return;
            }

            const items = window.PhotoStagingArchive.items || [];
            if (items.length === 0) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Görsel havuzunda damgalanacak fotoğraf bulunamadı.', 'warning');
                }
                return;
            }

            const dataUrl = el.dataset.badgeDataUrl;
            if (!dataUrl) return;

            const badgeImg = new Image();
            badgeImg.src = dataUrl;
            await new Promise(r => { badgeImg.onload = r; badgeImg.onerror = r; });

            const container = document.getElementById('canvas-container');
            const cW = container ? container.offsetWidth : 1920;
            const cH = container ? container.offsetHeight : 1080;

            const bLeft = parseInt(el.style.left) || 0;
            const bTop = parseInt(el.style.top) || 0;
            const bW = parseInt(el.style.width) || 180;
            const bH = parseInt(el.style.height) || 180;

            const relX = bLeft / cW;
            const relY = bTop / cH;
            const relW = bW / cW;
            const relH = bH / cH;
            const opacity = (parseInt(el.dataset.opacity || 100)) / 100;
            const rotation = (parseInt(el.dataset.rotation || 0)) * Math.PI / 180;

            if (typeof window.showAppLoading === 'function') {
                window.showAppLoading('Rozet Damgalanıyor...', `Havuzdaki ${items.length} görsele uygulanıyor`);
            }

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                try {
                    const baseImg = new Image();
                    baseImg.src = item.preWatermarkDataUrl || item.dataUrl;
                    await new Promise(r => { baseImg.onload = r; baseImg.onerror = r; });

                    const cvs = document.createElement('canvas');
                    cvs.width = baseImg.naturalWidth || 1920;
                    cvs.height = baseImg.naturalHeight || 1080;
                    const ctx = cvs.getContext('2d');
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    // Orijinal görseli çiz
                    ctx.drawImage(baseImg, 0, 0, cvs.width, cvs.height);

                    // Rozeti orantılı çiz
                    const dw = cvs.width * relW;
                    const dh = cvs.height * relH;
                    const dx = cvs.width * relX;
                    const dy = cvs.height * relY;

                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.translate(dx + dw / 2, dy + dh / 2);
                    if (rotation !== 0) ctx.rotate(rotation);
                    ctx.drawImage(badgeImg, -dw / 2, -dh / 2, dw, dh);
                    ctx.restore();

                    item.dataUrl = cvs.toDataURL('image/jpeg', 0.95);
                    cvs.width = 0;
                    cvs.height = 0;
                } catch (e) {
                    console.warn('[CustomBadges] Damgalama hatası:', e);
                }
            }

            if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
            if (typeof window.PhotoStagingArchive.renderPanel === 'function') {
                window.PhotoStagingArchive.renderPanel();
            }
            if (typeof window.showAppToast === 'function') {
                window.showAppToast('Rozet tüm havuz görsellerine başarıyla damgalandı.', 'success', 3000);
            }
        },

        /**
         * Global Tuval Seçim Olaylarını Dinle
         */
        bindGlobalCanvasEvents: function() {
            document.addEventListener('click', (e) => {
                const target = e.target;
                if (!target) return;

                const badge = target.closest('.custom-graphic-badge');
                if (badge) {
                    this.selectBadge(badge);
                } else if (!target.closest('#customBadgeSettingsPanel') && !target.closest('.custom-badge-session-grid')) {
                    // Dış tıklandığında seçim çerçevesini kaldır (ayarlar paneli açık kalabilir)
                    if (this.selectedBadgeEl && !target.closest('#canvas-container')) {
                        // Koru
                    }
                }
            });
        }
    };

    window.CustomBadges = CustomBadges;

    // DOM Hazır Olduğunda Başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CustomBadges.init());
    } else {
        setTimeout(() => CustomBadges.init(), 100);
    }

})(window);
