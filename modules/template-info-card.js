/**
 * ========================================================
 * EMLAK STÜDYOM - AKILLI BİLGİ KARTI MODÜLÜ
 * modules/template-info-card.js
 * ========================================================
 */

(function(window) {
    'use strict';

    const TemplateInfoCard = {
        currentPosition: 'bottom',
        currentTheme: 'luxury-dark',
        userManuallySelectedTheme: false,
        customBg: null,
        savedFrameSnapshots: null,

        /**
         * Bilgi Kartı Ekle ve Mevcut Çerçeveleri Orantılı Olarak Kaydır
         */
        addCard: function(position = 'bottom', customData = {}) {
            const cContainer = document.getElementById('canvas-container');
            const uiLayer = document.getElementById('ui-layer') || cContainer;
            if (!cContainer || !uiLayer) return;

            // Arka plana göre varsayılan uyumlu temayı otomatik tespit et
            if (!this.userManuallySelectedTheme && !this.customBg) {
                const curBgColor = cContainer.style.backgroundColor || '';
                const curBgImg = cContainer.style.backgroundImage || '';
                const activeBgVal = (curBgImg && curBgImg !== 'none') ? curBgImg : curBgColor;
                if (activeBgVal && activeBgVal !== 'transparent') {
                    this.currentTheme = this.getMatchingThemeForBackground(curBgImg && curBgImg !== 'none' ? 'gradient' : 'color', activeBgVal);
                }
            }
            const themeSelect = document.getElementById('tbInfoCardTheme');
            if (themeSelect) themeSelect.value = this.currentTheme;

            const cW = parseFloat(cContainer.style.width) || cContainer.offsetWidth || 1920;
            const cH = parseFloat(cContainer.style.height) || cContainer.offsetHeight || 1080;
            const pad = 32;

            // Önceki kart varsa temizle (önceki çerçeve konumlarını koruyarak)
            const existingCard = document.getElementById('tb-active-info-card');
            if (existingCard) {
                existingCard.remove();
            }

            // Mevcut çerçeveleri yakala
            const frames = Array.from(document.querySelectorAll('.tb-image-frame'));

            // Eğer ilk kez kart ekleniyorsa veya önceki snapshot yoksa mevcut hallerini sakla
            if (!this.savedFrameSnapshots && frames.length > 0) {
                this.savedFrameSnapshots = frames.map(f => ({
                    el: f,
                    left: parseFloat(f.style.left) || f.offsetLeft,
                    top: parseFloat(f.style.top) || f.offsetTop,
                    width: f.offsetWidth,
                    height: f.offsetHeight
                }));
            }

            this.currentPosition = position;

            // Çerçeveleri Orantılı Olarak Yeniden Konumlandır
            if (this.savedFrameSnapshots && this.savedFrameSnapshots.length > 0) {
                this.rebalanceFrames(position, cW, cH, pad);
            }

            // Bilgi Kartı DOM Elemanını Oluştur
            const card = document.createElement('div');
            card.id = 'tb-active-info-card';
            card.dataset.label = 'Bilgi Kartuşu';
            card.className = `draggable canvas-el tb-info-card tb-ic-theme-${this.currentTheme} ${position === 'left' || position === 'right' ? 'vertical' : 'horizontal'}`;

            // Pozisyon Koordinatları
            if (position === 'bottom') {
                const cardH = Math.round(cH * 0.19);
                const cardTop = cH - cardH - pad;
                card.style.left = pad + 'px';
                card.style.top = cardTop + 'px';
                card.style.width = (cW - (pad * 2)) + 'px';
                card.style.height = cardH + 'px';
            } else if (position === 'top') {
                const cardH = Math.round(cH * 0.19);
                card.style.left = pad + 'px';
                card.style.top = pad + 'px';
                card.style.width = (cW - (pad * 2)) + 'px';
                card.style.height = cardH + 'px';
            } else if (position === 'right') {
                const cardW = Math.round(cW * 0.26);
                card.style.left = (cW - cardW - pad) + 'px';
                card.style.top = pad + 'px';
                card.style.width = cardW + 'px';
                card.style.height = (cH - (pad * 2)) + 'px';
            } else if (position === 'left') {
                const cardW = Math.round(cW * 0.26);
                card.style.left = pad + 'px';
                card.style.top = pad + 'px';
                card.style.width = cardW + 'px';
                card.style.height = (cH - (pad * 2)) + 'px';
            }

            // Özel arka plan rengi varsa uygula
            if (this.customBg) {
                card.style.setProperty('background', this.customBg, 'important');
                if (this.isLightColor(this.customBg)) {
                    card.classList.add('tb-ic-light-mode');
                }
            }

            // İçerik Verileri
            const title = customData.title || 'LÜKS GAYRİMENKUL';
            const sub = customData.sub || 'Merkezi Konum • Prestijli Yaşam Alanı';
            const price = customData.price || '28.500.000 TL';
            const specs = customData.specs || ['4+1 Oda', '260 m²', 'Akıllı Ev', 'Kapalı Otopark'];
            const agent = customData.agent || 'Ahmet Yılmaz • 0532 123 45 67 • Remax Gold';

            const specsHtml = specs.map(s => `<div class="tb-ic-spec-pill" title="Düzenlemek için çift tıklayın">${s}</div>`).join('');

            card.innerHTML = `
                <button type="button" class="tb-ic-close-btn" title="Bilgi Kartını Kaldır" onclick="TemplateInfoCard.removeCard()"><i class="fa-solid fa-xmark"></i></button>
                <div class="tb-ic-left-col">
                    <div class="tb-ic-title" title="Düzenlemek için çift tıklayın">${title}</div>
                    <div class="tb-ic-sub" title="Düzenlemek için çift tıklayın">${sub}</div>
                </div>
                <div class="tb-ic-center-col">
                    ${specsHtml}
                </div>
                <div class="tb-ic-right-col">
                    <div class="tb-ic-price" title="Düzenlemek için çift tıklayın">${price}</div>
                    <div class="tb-ic-agent" title="Düzenlemek için çift tıklayın">${agent}</div>
                </div>
            `;

            uiLayer.appendChild(card);

            // Sürüklenebilir Yap
            if (typeof window.bindDrag === 'function') {
                window.bindDrag(card);
            }

            // Çift Tıklama ile Metin Düzenleme
            card.querySelectorAll('.tb-ic-title, .tb-ic-sub, .tb-ic-price, .tb-ic-agent, .tb-ic-spec-pill').forEach(el => {
                if (typeof window.enableInlineEdit === 'function') {
                    window.enableInlineEdit(el);
                } else {
                    el.addEventListener('dblclick', function() {
                        const newText = prompt('Yeni metni girin:', this.textContent.trim());
                        if (newText !== null && newText.trim() !== '') {
                            this.textContent = newText.trim();
                        }
                    });
                }
            });

            if (typeof window.renderLayers === 'function') {
                window.renderLayers();
            }

            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Bilgi Kartı Eklendi');
            }
        },

        /**
         * Çerçeveleri Yeni Boşluğa Göre Orantılı Ölçekle & Kaydır
         */
        rebalanceFrames: function(pos, cW, cH, pad) {
            if (!this.savedFrameSnapshots || this.savedFrameSnapshots.length === 0) return;

            // Bounding box hesapla
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            this.savedFrameSnapshots.forEach(item => {
                minX = Math.min(minX, item.left);
                maxX = Math.max(maxX, item.left + item.width);
                minY = Math.min(minY, item.top);
                maxY = Math.max(maxY, item.top + item.height);
            });

            const spanW = maxX - minX || 1;
            const spanH = maxY - minY || 1;

            if (pos === 'bottom') {
                // Kart altta: Çerçeveler üst alana sıkıştırılır
                const targetTop = pad;
                const targetH = Math.round(cH * 0.73) - pad;

                this.savedFrameSnapshots.forEach(item => {
                    if (!item.el || !item.el.parentNode) return;
                    const relY = (item.top - minY) / spanH;
                    const relH = item.height / spanH;
                    const newH = Math.max(60, Math.round(targetH * relH));
                    const newY = Math.round(targetTop + (targetH * relY));

                    item.el.style.top = newY + 'px';
                    item.el.style.height = newH + 'px';
                    item.el.style.left = item.left + 'px';
                    item.el.style.width = item.width + 'px';
                });

            } else if (pos === 'top') {
                // Kart üstte: Çerçeveler alt alana sıkıştırılır
                const cardH = Math.round(cH * 0.19);
                const targetTop = pad + cardH + 16;
                const targetH = cH - targetTop - pad;

                this.savedFrameSnapshots.forEach(item => {
                    if (!item.el || !item.el.parentNode) return;
                    const relY = (item.top - minY) / spanH;
                    const relH = item.height / spanH;
                    const newH = Math.max(60, Math.round(targetH * relH));
                    const newY = Math.round(targetTop + (targetH * relY));

                    item.el.style.top = newY + 'px';
                    item.el.style.height = newH + 'px';
                    item.el.style.left = item.left + 'px';
                    item.el.style.width = item.width + 'px';
                });

            } else if (pos === 'right') {
                // Kart sağda: Çerçeveler sol alana sıkıştırılır
                const targetLeft = pad;
                const targetW = Math.round(cW * 0.70) - pad;

                this.savedFrameSnapshots.forEach(item => {
                    if (!item.el || !item.el.parentNode) return;
                    const relX = (item.left - minX) / spanW;
                    const relW = item.width / spanW;
                    const newW = Math.max(80, Math.round(targetW * relW));
                    const newX = Math.round(targetLeft + (targetW * relX));

                    item.el.style.left = newX + 'px';
                    item.el.style.width = newW + 'px';
                    item.el.style.top = item.top + 'px';
                    item.el.style.height = item.height + 'px';
                });

            } else if (pos === 'left') {
                // Kart solda: Çerçeveler sağ alana sıkıştırılır
                const cardW = Math.round(cW * 0.26);
                const targetLeft = pad + cardW + 16;
                const targetW = cW - targetLeft - pad;

                this.savedFrameSnapshots.forEach(item => {
                    if (!item.el || !item.el.parentNode) return;
                    const relX = (item.left - minX) / spanW;
                    const relW = item.width / spanW;
                    const newW = Math.max(80, Math.round(targetW * relW));
                    const newX = Math.round(targetLeft + (targetW * relX));

                    item.el.style.left = newX + 'px';
                    item.el.style.width = newW + 'px';
                    item.el.style.top = item.top + 'px';
                    item.el.style.height = item.height + 'px';
                });
            }
        },

        /**
         * Bilgi Kartını Kaldır ve Çerçeveleri Orijinal Boyutlarına Döndür
         */
        removeCard: function() {
            const card = document.getElementById('tb-active-info-card');
            if (card) card.remove();

            // Çerçeveleri orijinal boyutlarına geri getir
            if (this.savedFrameSnapshots && this.savedFrameSnapshots.length > 0) {
                this.savedFrameSnapshots.forEach(item => {
                    if (item.el && item.el.parentNode) {
                        item.el.style.left = item.left + 'px';
                        item.el.style.top = item.top + 'px';
                        item.el.style.width = item.width + 'px';
                        item.el.style.height = item.height + 'px';
                    }
                });
                this.savedFrameSnapshots = null;
            }

            if (typeof window.renderLayers === 'function') {
                window.renderLayers();
            }

            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Bilgi Kartı Kaldırıldı');
            }
        },

        /**
         * Kartın Temasını Değiştir (16 Lüks Tema)
         */
        setTheme: function(themeName, isUserAction = true) {
            this.currentTheme = themeName;
            if (isUserAction) {
                this.userManuallySelectedTheme = true;
            }
            const card = document.getElementById('tb-active-info-card');
            if (!card) return;

            // Önceki tüm tema sınıflarını temizle
            const themeClasses = Array.from(card.classList).filter(cls => cls.startsWith('tb-ic-theme-'));
            themeClasses.forEach(cls => card.classList.remove(cls));
            card.classList.add('tb-ic-theme-' + themeName);

            // Eğer özel arka plan rengi atanmışsa onu koru, atanmamışsa temanın kendi stilini kullan
            if (this.customBg) {
                card.style.setProperty('background', this.customBg, 'important');
                if (this.isLightColor(this.customBg)) {
                    card.classList.add('tb-ic-light-mode');
                } else {
                    card.classList.remove('tb-ic-light-mode');
                }
            } else {
                card.style.removeProperty('background');
                card.style.background = '';
                card.classList.remove('tb-ic-light-mode');
            }
        },

        /**
         * Kart İçin Bağımsız Özel Arka Plan Rengi Belirle
         */
        setCustomBackground: function(val) {
            this.customBg = val;
            const card = document.getElementById('tb-active-info-card');
            if (card) {
                card.style.setProperty('background', val, 'important');
                if (this.isLightColor(val)) {
                    card.classList.add('tb-ic-light-mode');
                } else {
                    card.classList.remove('tb-ic-light-mode');
                }
            }

            const picker = document.getElementById('tbInfoCardBgColor');
            if (picker && typeof val === 'string' && val.startsWith('#')) {
                picker.value = val;
            }
        },

        /**
         * Özel Kart Rengini Sıfırla ve Temanın Varsayılanına Dön
         */
        resetCustomBackground: function() {
            this.customBg = null;
            const card = document.getElementById('tb-active-info-card');
            if (card) {
                card.style.removeProperty('background');
                card.style.background = '';
                card.classList.remove('tb-ic-light-mode');
                this.setTheme(this.currentTheme, false);
            }
        },

        /**
         * Verilen arka plan türü ve değerine en uyumlu lüks temayı akıllıca tespit et
         */
        getMatchingThemeForBackground: function(type, val, presetName) {
            if (!val || type === 'transparent') return 'clean-light';

            // 1. İsim / Preset anahtar kelime önceliği
            let nameOrPreset = presetName || '';
            if (!nameOrPreset && typeof window !== 'undefined' && window.TemplateBgData) {
                const found = window.TemplateBgData.find(p => p.value === val);
                if (found) nameOrPreset = found.name;
            }

            const str = ((nameOrPreset || '') + ' ' + String(val)).toLowerCase();
            
            if (str.includes('zümrüt') || str.includes('emerald')) return 'emerald';
            if (str.includes('adaçayı') || str.includes('mint') || str.includes('sis yeşili') || str.includes('zeytin') || str.includes('orman')) {
                return (str.includes('derin') || str.includes('koyu')) ? 'emerald' : 'forest-nature';
            }
            if (str.includes('safir') || str.includes('kobalt') || str.includes('sapphire') || str.includes('geceyarısı mavisi') || str.includes('emlak mavisi')) return 'sapphire';
            if (str.includes('okyanus') || str.includes('turkuaz') || str.includes('petrol') || str.includes('cyan')) return 'ocean-turquoise';
            if (str.includes('neon') || str.includes('siber')) return 'cyber-neon';
            if (str.includes('altın') || str.includes('amber') || str.includes('bronz') || str.includes('gold')) return 'gold-amber';
            if (str.includes('bordo') || str.includes('mor') || str.includes('burgundy') || str.includes('kadife')) return 'royal-burgundy';
            if (str.includes('yakut') || str.includes('crimson') || str.includes('kırmızı') || str.includes('ruby')) return 'ruby-crimson';
            if (str.includes('terakota') || str.includes('kiremit') || str.includes('turuncu') || str.includes('terracotta')) return 'terracotta';
            if (str.includes('rose') || str.includes('şampanya') || str.includes('champagne') || str.includes('pudra') || str.includes('pembe')) return 'rose-champagne';
            if (str.includes('keten') || str.includes('vizon') || str.includes('latte') || str.includes('kum') || str.includes('taş') || str.includes('kaşmir') || str.includes('kemik') || str.includes('linen')) return 'warm-linen';
            if (str.includes('gece siyahı') || str.includes('kömür') || str.includes('pure black') || str.includes('mat siyah')) return 'midnight-pure';
            if (str.includes('platin') || str.includes('metalik') || str.includes('füme') || str.includes('grafit') || str.includes('beton')) return 'platinum';
            if (str.includes('fildişi') || str.includes('inci') || str.includes('mermer') || str.includes('kristal') || str.includes('beyaz') || str.includes('light')) return 'clean-light';
            if (str.includes('antrasit') || str.includes('koyu')) return 'luxury-dark';

            // 2. Renk kodu analizi (HEX / RGB)
            let hex = null;
            const hexMatch = val.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/);
            if (hexMatch) {
                hex = hexMatch[0];
            } else {
                const rgbMatch = val.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
                if (rgbMatch) {
                    const r = parseInt(rgbMatch[1]), g = parseInt(rgbMatch[2]), b = parseInt(rgbMatch[3]);
                    hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
                }
            }

            if (!hex) return 'luxury-dark';

            let c = hex.replace('#', '');
            if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
            const r = parseInt(c.substring(0, 2), 16) / 255;
            const g = parseInt(c.substring(2, 4), 16) / 255;
            const b = parseInt(c.substring(4, 6), 16) / 255;

            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            const d = max - min;
            let h = 0;
            const s = max === 0 ? 0 : d / max;
            const v = max;

            if (d !== 0) {
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h *= 60;
            }

            // Düşük doygunluk (siyah, gri, beyaz)
            if (s < 0.16) {
                if (v < 0.15) return 'midnight-pure';
                if (v < 0.40) return 'luxury-dark';
                if (v > 0.82) return 'clean-light';
                return 'platinum';
            }

            // Renk çemberi (Hue)
            if (h >= 75 && h <= 165) return (v < 0.40 || s > 0.6) ? 'emerald' : 'forest-nature';
            if (h > 165 && h <= 200) return 'ocean-turquoise';
            if (h > 200 && h <= 255) return 'sapphire';
            if (h > 255 && h <= 325) return 'royal-burgundy';
            if (h > 325 || h < 18) return 'ruby-crimson';
            if (h >= 18 && h <= 45) return (v > 0.75 && s < 0.45) ? 'rose-champagne' : 'terracotta';
            if (h > 45 && h < 75) return (v > 0.80 && s < 0.35) ? 'warm-linen' : 'gold-amber';

            return 'luxury-dark';
        },

        /**
         * Arka plan değiştiğinde uyumlu temayı karta ve arayüze otomatik uygula
         */
        applyMatchingThemeForBackground: function(type, val, presetName) {
            const matchedTheme = this.getMatchingThemeForBackground(type, val, presetName);
            if (!matchedTheme) return;

            this.currentTheme = matchedTheme;
            this.userManuallySelectedTheme = false;

            // Sol paneldeki select elemanını senkronize et
            const themeSelect = document.getElementById('tbInfoCardTheme');
            if (themeSelect) {
                themeSelect.value = matchedTheme;
            }

            // Aktif kart varsa ve kullanıcı bağımsız özel renk tanımlamamışsa temayı uygula
            const card = document.getElementById('tb-active-info-card');
            if (card) {
                if (!this.customBg) {
                    this.setTheme(matchedTheme, false);
                } else {
                    // Özel arka plan atanmış olsa bile tema sınıflarını (rozet, metin rengi vb.) güncelle
                    const themeClasses = Array.from(card.classList).filter(cls => cls.startsWith('tb-ic-theme-'));
                    themeClasses.forEach(cls => card.classList.remove(cls));
                    card.classList.add('tb-ic-theme-' + matchedTheme);
                }
            }
        },

        /**
         * Rengin Açık mı Koyu mu Olduğunu YIQ Algoritması ile Tespit Et
         */
        isLightColor: function(hex) {
            if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return false;
            let c = hex.replace('#', '');
            if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
            if (c.length !== 6) return false;
            const r = parseInt(c.substring(0, 2), 16);
            const g = parseInt(c.substring(2, 4), 16);
            const b = parseInt(c.substring(4, 6), 16);
            const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
            return yiq >= 150;
        },

        /**
         * Tuval Boyutu Değiştiğinde Aktif Bilgi Kartını Yeni Boyuta Uyarla
         */
        repositionCard: function(cW, cH) {
            const card = document.getElementById('tb-active-info-card');
            if (!card) return;
            const pad = 32;
            const position = this.currentPosition || 'bottom';

            if (position === 'bottom') {
                const cardH = Math.round(cH * 0.19);
                const cardTop = cH - cardH - pad;
                card.style.left = pad + 'px';
                card.style.top = cardTop + 'px';
                card.style.width = (cW - (pad * 2)) + 'px';
                card.style.height = cardH + 'px';
            } else if (position === 'top') {
                const cardH = Math.round(cH * 0.19);
                card.style.left = pad + 'px';
                card.style.top = pad + 'px';
                card.style.width = (cW - (pad * 2)) + 'px';
                card.style.height = cardH + 'px';
            } else if (position === 'right') {
                const cardW = Math.round(cW * 0.26);
                card.style.left = (cW - cardW - pad) + 'px';
                card.style.top = pad + 'px';
                card.style.width = cardW + 'px';
                card.style.height = (cH - (pad * 2)) + 'px';
            } else if (position === 'left') {
                const cardW = Math.round(cW * 0.26);
                card.style.left = pad + 'px';
                card.style.top = pad + 'px';
                card.style.width = cardW + 'px';
                card.style.height = (cH - (pad * 2)) + 'px';
            }
        }
    };

    window.TemplateInfoCard = TemplateInfoCard;

})(window);
