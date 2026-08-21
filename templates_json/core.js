/**
 * ============================================================================
 * 👑 PRO JSON ŞABLON KAYIT & ÇALIŞTIRMA MOTORU (CORE REGISTRY)
 * templates_json/core.js
 * ============================================================================
 * Modüler şablon kayıt sistemi (registerProJsonTemplate), akıllı metin
 * eşleştirme ve arayüz yöneticisi.
 */

(function(window) {
    'use strict';

    // Global Şablon Havuzu
    window.PRO_JSON_TEMPLATES = window.PRO_JSON_TEMPLATES || [];

    /**
     * Yeni bir JSON şablonunu sisteme kaydeder.
     * İster 16:9, 1:1, 4:5, 9:16 dosyalarından, ister custom_templates.js'den çağrılsın.
     */
    window.registerProJsonTemplate = function(templateObj) {
        if (!templateObj || !templateObj.id || !templateObj.format) {
            console.warn('Geçersiz şablon tanımı:', templateObj);
            return;
        }

        const existingIdx = window.PRO_JSON_TEMPLATES.findIndex(t => t.id === templateObj.id);
        if (existingIdx >= 0) {
            // Varsa güncelle
            window.PRO_JSON_TEMPLATES[existingIdx] = templateObj;
        } else {
            // Yoksa listeye ekle
            window.PRO_JSON_TEMPLATES.push(templateObj);
        }

        // Eğer aktif sekme pro_json ise arayüzü anında güncelle
        if (typeof document !== 'undefined') {
            const container = document.getElementById('tpl-content-pro_json');
            if (container && typeof window.renderProJsonTemplatesTab === 'function') {
                const activeFmt = window._proJsonActiveFormat || 'all';
                const activeCat = window._proJsonActiveCat || 'all';
                window.renderProJsonTemplatesTab(container, activeFmt, activeCat);
            }
        }
    };

    /**
     * Seçilen PRO JSON şablonunu tuvale yükler.
     */
    window.loadJsonTemplate = function(tplIdOrObj) {
        let tpl = typeof tplIdOrObj === 'string' 
            ? window.PRO_JSON_TEMPLATES.find(t => t.id === tplIdOrObj) 
            : tplIdOrObj;

        if (!tpl) {
            console.error('Şablon bulunamadı:', tplIdOrObj);
            return;
        }

        console.log('👑 PRO JSON Şablonu Yükleniyor:', tpl.name, tpl.format);

        // 1. Tuval Formatını Şablona Uyarla
        const formatMap = {
            '16:9': '16:9 Full HD (YouTube/Banner)',
            '1:1': '1:1 Kare (Instagram/Sahibinden)',
            '4:5': '4:5 Portre (Instagram Gönderi)',
            '9:16': '9:16 Dikey (Story/Reels/TikTok)'
        };

        const targetFormatName = formatMap[tpl.format] || '16:9 Full HD (YouTube/Banner)';
        const previewSelect = document.getElementById('previewFormat');
        const exportSelect = document.getElementById('exportFormat');

        if (previewSelect) previewSelect.value = targetFormatName;
        if (exportSelect) exportSelect.value = targetFormatName;

        if (typeof window.switchPreviewFormat === 'function') {
            window.switchPreviewFormat();
        }

        // 2. Tuval Katmanlarını Temizle (Fotoğrafı Koru, Eski Şablon Elementlerini Kaldır)
        const renderLayer = document.getElementById('canva-render-layer');
        if (renderLayer) {
            renderLayer.innerHTML = '';
            renderLayer.style.display = 'block';
        }

        window.activeJsonTemplateId = tpl.id;
        window.activeJsonTemplateData = tpl;
        window.isCanvaMode = true;

        // 3. Şablon Elemanlarını Tuvale Ekle
        if (tpl.elements && Array.isArray(tpl.elements) && renderLayer) {
            tpl.elements.forEach((elData, idx) => {
                const el = document.createElement('div');
                el.id = elData.id || ('pje_' + idx);
                el.className = 'canvas-el draggable editable-text pro-json-el';
                if (elData.field) el.dataset.field = elData.field;
                if (elData.style) el.setAttribute('style', elData.style);
                el.innerHTML = elData.html || elData.text || '';
                
                renderLayer.appendChild(el);

                // Sürüklenebilir ve çift tıkla düzenlenebilir yap
                if (typeof makeDraggable === 'function') makeDraggable(el);
                if (typeof bindDrag === 'function') bindDrag(el);
            });
        }

        // 4. Eğer önceden süzülmüş metin verisi varsa anında şablona aktar
        if (window.lastParsedData) {
            window.applyParsedDataToJsonTemplate(window.lastParsedData);
        }

        // 5. Katman Düzenleyiciyi Çalıştır
        if (typeof window.arrangeLayers === 'function') {
            window.arrangeLayers(renderLayer);
        }

        if (typeof redrawAll === 'function') redrawAll();
        if (typeof saveHistoryState === 'function') saveHistoryState('PRO Şablon: ' + tpl.name);

        // Bildirim
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `👑 ${tpl.name} yüklendi (${tpl.format})`,
                showConfirmButton: false,
                timer: 2000,
                background: '#1e293b',
                color: '#fff'
            });
        }
    };

    /**
     * Akıllı "Metni Süz" verilerini şablondaki ilgili data-field alanlarına aktarır.
     */
    window.applyParsedDataToJsonTemplate = function(parsedData) {
        if (!parsedData) return;
        const renderLayer = document.getElementById('canva-render-layer');
        if (!renderLayer) return;

        const p = parsedData;
        console.log('⚡ Parsed Data PRO Şablona aktarılıyor:', p);

        // 1. Fiyat
        if (p.price) {
            renderLayer.querySelectorAll('[data-field="price"]').forEach(el => {
                el.innerHTML = p.price;
            });
        }

        // 2. Durum / Başlık Rozeti
        if (p.status || p.propertyType) {
            const statusText = p.status || p.propertyType;
            renderLayer.querySelectorAll('[data-field="badge"], [data-field="status"]').forEach(el => {
                const icon = el.querySelector('i');
                const iconHtml = icon ? icon.outerHTML + ' ' : '';
                el.innerHTML = iconHtml + statusText.toUpperCase();
            });
        }

        // 3. Lokasyon / Konum
        if (p.location) {
            renderLayer.querySelectorAll('[data-field="location"]').forEach(el => {
                const icon = el.querySelector('i');
                const iconHtml = icon ? icon.outerHTML + ' ' : '';
                el.innerHTML = iconHtml + p.location;
            });
        }

        // 4. Oda Sayısı
        if (p.rooms) {
            renderLayer.querySelectorAll('[data-field="rooms"]').forEach(el => {
                el.innerHTML = p.rooms;
            });
        }

        // 5. Metrekare (m²)
        const sizeVal = (p.sizes && (p.sizes.brut || p.sizes.net)) ? (p.sizes.brut || p.sizes.net) : (p.size || '');
        if (sizeVal) {
            renderLayer.querySelectorAll('[data-field="size"], [data-field="m2"]').forEach(el => {
                el.innerHTML = sizeVal.includes('m²') ? sizeVal : (sizeVal + ' m²');
            });
        }

        // 6. Kat Bilgisi
        if (p.floor) {
            renderLayer.querySelectorAll('[data-field="floor"]').forEach(el => {
                el.innerHTML = p.floor;
            });
        }

        // 7. Isıtma
        if (p.heating) {
            renderLayer.querySelectorAll('[data-field="heating"]').forEach(el => {
                el.innerHTML = p.heating;
            });
        }

        // 8. Arsa / Ada / Parsel
        if (p.land && (p.land.ada || p.land.parsel)) {
            const apText = `ADA: ${p.land.ada || '-'} / PARSEL: ${p.land.parsel || '-'}`;
            renderLayer.querySelectorAll('[data-field="land"], [data-field="ada_parsel"]').forEach(el => {
                const icon = el.querySelector('i');
                const iconHtml = icon ? icon.outerHTML + ' ' : '';
                el.innerHTML = iconHtml + apText;
            });
        }

        // 9. Açıklama
        if (p.description) {
            renderLayer.querySelectorAll('[data-field="desc"]').forEach(el => {
                el.innerHTML = p.description;
            });
        }

        if (typeof redrawAll === 'function') redrawAll();
    };

    /**
     * Geçerli Tuval Tasarımını Şablon JSON Objesine Çevirir (Kullanıcı Kolayca Yeni Şablon Üretsin Diye).
     */
    window.exportCurrentCanvasAsJsonTemplate = function(name = 'Özel Şablon', format = '16:9', category = 'konut') {
        const renderLayer = document.getElementById('canva-render-layer');
        const elements = [];

        if (renderLayer) {
            renderLayer.querySelectorAll('.canvas-el').forEach((el, idx) => {
                elements.push({
                    id: el.id || ('el_' + idx),
                    field: el.dataset.field || 'custom',
                    style: el.getAttribute('style') || '',
                    html: el.innerHTML || ''
                });
            });
        }

        const tplObj = {
            id: 'custom_' + Date.now().toString(36),
            name: name,
            format: format,
            w: (format === '16:9' ? 1920 : (format === '4:5' ? 1080 : (format === '9:16' ? 1080 : 1080))),
            h: (format === '16:9' ? 1080 : (format === '4:5' ? 1350 : (format === '9:16' ? 1920 : 1080))),
            category: category,
            badge: '👑 ÖZEL',
            previewBg: 'linear-gradient(135deg, #1e293b, #0f172a)',
            elements: elements
        };

        const jsonCode = `window.registerProJsonTemplate(${JSON.stringify(tplObj, null, 4)});\n`;
        
        // Panoya Kopyala
        if (navigator.clipboard) {
            navigator.clipboard.writeText(jsonCode).then(() => {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: '📋 Şablon Kodu Panoya Kopyalandı!',
                        text: 'templates_json/custom_templates.js dosyasına yapıştırarak yeni şablonunuzu ekleyebilirsiniz.',
                        background: '#1e293b',
                        color: '#fff'
                    });
                } else {
                    alert('Şablon kodu panoya kopyalandı!');
                }
            });
        }

        return tplObj;
    };

    window.promptExportJsonTemplate = function() {
        const tplName = prompt('Oluşturulacak şablon için bir isim girin:', 'Yeni Lüks Portföy');
        if (!tplName) return;
        const curFmtVal = document.getElementById('previewFormat')?.value || '16:9';
        const curFmt = curFmtVal.includes('1:1') ? '1:1' :
                       curFmtVal.includes('4:5') ? '4:5' :
                       curFmtVal.includes('9:16') ? '9:16' : '16:9';
        window.exportCurrentCanvasAsJsonTemplate(tplName, curFmt, 'konut');
    };

    /**
     * Arayüzdeki PRO Şablon Kartlarını Render Eder.
     */
    window.renderProJsonTemplatesTab = function(containerEl, activeFormat = 'all', activeCat = 'all') {
        if (!containerEl) return;

        window._proJsonActiveFormat = activeFormat;
        window._proJsonActiveCat = activeCat;

        let filtered = window.PRO_JSON_TEMPLATES;
        if (activeFormat !== 'all') {
            filtered = filtered.filter(t => t.format === activeFormat);
        }
        if (activeCat !== 'all') {
            filtered = filtered.filter(t => t.category === activeCat);
        }

        // Format sayılarını dinamik hesapla
        const count16_9 = window.PRO_JSON_TEMPLATES.filter(t => t.format === '16:9').length;
        const count1_1 = window.PRO_JSON_TEMPLATES.filter(t => t.format === '1:1').length;
        const count4_5 = window.PRO_JSON_TEMPLATES.filter(t => t.format === '4:5').length;
        const count9_16 = window.PRO_JSON_TEMPLATES.filter(t => t.format === '9:16').length;

        let html = `
            <div style="padding: 12px 10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div style="font-size:12px; font-weight:800; color:#cbd5e1; display:flex; align-items:center; gap:6px;">
                        <span>👑 PRO JSON KÜTÜPHANESİ</span>
                        <span style="background:linear-gradient(135deg,#eab308,#ca8a04); color:#000; font-size:10px; padding:1px 6px; border-radius:10px; font-weight:900;">${filtered.length} / ${window.PRO_JSON_TEMPLATES.length}</span>
                    </div>
                    <button type="button" onclick="window.promptExportJsonTemplate()" style="background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; font-size:10px; font-weight:700; padding:4px 8px; border-radius:6px; border:none; cursor:pointer;" title="Mevcut tuval tasarımınızı yeni şablon kodu olarak panoya kopyalar">
                        <i class="fas fa-copy"></i> Şablon Kodu Al
                    </button>
                </div>

                <!-- Format Filtre Butonları -->
                <div style="display:flex; gap:4px; margin-bottom:10px; overflow-x:auto; padding-bottom:4px;" class="custom-scroll">
                    <button type="button" class="tab-btn ${activeFormat === 'all' ? 'active' : ''}" onclick="window.filterProJsonTab('all', '${activeCat}')" style="font-size:11px; padding:4px 10px; border-radius:6px;">Tümü (${window.PRO_JSON_TEMPLATES.length})</button>
                    <button type="button" class="tab-btn ${activeFormat === '16:9' ? 'active' : ''}" onclick="window.filterProJsonTab('16:9', '${activeCat}')" style="font-size:11px; padding:4px 10px; border-radius:6px;">16:9 (${count16_9})</button>
                    <button type="button" class="tab-btn ${activeFormat === '1:1' ? 'active' : ''}" onclick="window.filterProJsonTab('1:1', '${activeCat}')" style="font-size:11px; padding:4px 10px; border-radius:6px;">1:1 (${count1_1})</button>
                    <button type="button" class="tab-btn ${activeFormat === '4:5' ? 'active' : ''}" onclick="window.filterProJsonTab('4:5', '${activeCat}')" style="font-size:11px; padding:4px 10px; border-radius:6px;">4:5 (${count4_5})</button>
                    <button type="button" class="tab-btn ${activeFormat === '9:16' ? 'active' : ''}" onclick="window.filterProJsonTab('9:16', '${activeCat}')" style="font-size:11px; padding:4px 10px; border-radius:6px;">9:16 (${count9_16})</button>
                </div>

                <!-- Kategori Filtre Butonları -->
                <div style="display:flex; gap:4px; margin-bottom:14px; overflow-x:auto; padding-bottom:4px;" class="custom-scroll">
                    <button type="button" class="dock-pill-btn ${activeCat === 'all' ? 'active' : ''}" onclick="window.filterProJsonTab('${activeFormat}', 'all')" style="font-size:10px; padding:2px 8px; border-radius:4px;">Tüm Tipler</button>
                    <button type="button" class="dock-pill-btn ${activeCat === 'konut' ? 'active' : ''}" onclick="window.filterProJsonTab('${activeFormat}', 'konut')" style="font-size:10px; padding:2px 8px; border-radius:4px;">🏠 Konut</button>
                    <button type="button" class="dock-pill-btn ${activeCat === 'villa' ? 'active' : ''}" onclick="window.filterProJsonTab('${activeFormat}', 'villa')" style="font-size:10px; padding:2px 8px; border-radius:4px;">💎 Lüks Villa</button>
                    <button type="button" class="dock-pill-btn ${activeCat === 'arsa' ? 'active' : ''}" onclick="window.filterProJsonTab('${activeFormat}', 'arsa')" style="font-size:10px; padding:2px 8px; border-radius:4px;">🌱 Arsa / Tarla</button>
                    <button type="button" class="dock-pill-btn ${activeCat === 'ticari' ? 'active' : ''}" onclick="window.filterProJsonTab('${activeFormat}', 'ticari')" style="font-size:10px; padding:2px 8px; border-radius:4px;">🏬 Ticari</button>
                </div>

                <!-- Şablon Kartları Izgarası -->
                <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">
        `;

        filtered.forEach(tpl => {
            let previewH = '85px';
            if (tpl.format === '1:1') previewH = '110px';
            if (tpl.format === '4:5') previewH = '130px';
            if (tpl.format === '9:16') previewH = '150px';

            html += `
                <div class="canva-tpl-card pro-tpl-card" onclick="window.loadJsonTemplate('${tpl.id}')" style="background:#0f172a; border:1px solid #1e293b; border-radius:10px; padding:8px; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between;" onmouseover="this.style.borderColor='#818cf8'; this.style.transform='translateY(-2px)';" onmouseout="this.style.borderColor='#1e293b'; this.style.transform='none';">
                    
                    <!-- Kart Önizleme Alanı -->
                    <div style="height:${previewH}; background:${tpl.previewBg}; border-radius:6px; margin-bottom:8px; position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; padding:6px; box-shadow:inset 0 0 15px rgba(0,0,0,0.5);">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="background:rgba(0,0,0,0.7); color:#fff; font-size:9px; font-weight:800; padding:2px 5px; border-radius:4px; border:1px solid rgba(255,255,255,0.15);">${tpl.format}</span>
                            <span style="background:rgba(234,179,8,0.2); color:#facc15; font-size:8px; font-weight:800; padding:2px 5px; border-radius:4px; border:1px solid rgba(234,179,8,0.4);">${tpl.badge}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                            <div style="width:28px; height:6px; background:rgba(255,255,255,0.3); border-radius:3px;"></div>
                            <div style="background:rgba(56,189,248,0.3); width:35px; height:8px; border-radius:3px; border:1px solid #38bdf8;"></div>
                        </div>
                    </div>

                    <!-- Kart Başlığı & Buton -->
                    <div>
                        <div style="font-size:11px; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:4px;" title="${tpl.name}">${tpl.name}</div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:9px; color:#94a3b8; text-transform:uppercase;">${tpl.category}</span>
                            <span style="font-size:10px; color:#818cf8; font-weight:700;">Seç ➔</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        containerEl.innerHTML = html;
    };

    window.filterProJsonTab = function(format, cat) {
        const container = document.getElementById('tpl-content-pro_json');
        if (container) {
            window.renderProJsonTemplatesTab(container, format, cat);
        }
    };

})(window);
