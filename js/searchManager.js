// searchManager.js
// Handles OmniSearch and Recent Tools functionality

window.OmniSearch = {
    searchIndex: [],
    recentTools: [],

    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        this.loadRecent();
        this.buildIndex();
        
        // Re-index after dynamic templates and assets finish loading
        setTimeout(() => this.buildIndex(), 1500);
        setTimeout(() => this.buildIndex(), 4000);
        
        const searchInput = document.getElementById('omniSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.performSearch(e.target.value));
        }

        // Global ESC key listener to close modals
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearch();
                this.closeRecent();
            }
        });
    },

    buildIndex: function() {
        const newIndex = [];
        const seenIds = new Set();

        const addEntry = (id, name, type, action, evalStr) => {
            if (!id || seenIds.has(id)) return;
            seenIds.add(id);
            newIndex.push({
                id: id,
                name: name,
                type: type,
                action: action,
                evalStr: evalStr
            });
        };
        
        // 1. Standart Şablonlar
        document.querySelectorAll('#templateGrid .template-btn').forEach(btn => {
            const name = btn.textContent.trim().replace(/[★☆]/g, '').trim();
            if (name && btn.id) {
                addEntry(
                    btn.id,
                    name,
                    'Standart Şablon',
                    () => {
                        btn.click();
                        this.addRecent(btn.id, name, 'Standart Şablon', "document.getElementById('" + btn.id + "')?.click();");
                    },
                    "document.getElementById('" + btn.id + "')?.click();"
                );
            }
        });

        // 2. Canva / Kolaj / Gelişmiş Şablonlar
        document.querySelectorAll('.canva-tpl-card').forEach(card => {
            const titleEl = card.querySelector('.tpl-name');
            const tagEl = card.querySelector('.tpl-tag');
            const title = titleEl ? titleEl.textContent.trim() : 'Şablon';
            const tag = tagEl ? tagEl.textContent.trim() : '';
            const fullName = title + (tag ? " (" + tag + ")" : "");
            
            let type = 'Gelişmiş Şablon';
            const parentId = card.closest('.accordion-container')?.id || '';
            if (parentId.includes('elit')) type = 'Elit Şablon';
            else if (parentId.includes('kolaj')) type = 'Kolaj';
            else if (parentId.includes('minimal')) type = 'Minimal';
            else if (parentId.includes('luks')) type = 'Lüks';
            else if (parentId.includes('kurumsal')) type = 'Kurumsal';
            else if (parentId.includes('dinamik')) type = 'Dinamik';
            else if (parentId.includes('klasik')) type = 'Klasik';
            else if (parentId.includes('sosyal')) type = 'Sosyal Medya';
            else if (parentId.includes('portfoy')) type = 'Portföy';
            else if (parentId.includes('ozel')) type = 'Özel';
            
            const cardId = card.dataset.id || card.id;
            if (cardId) {
                const actionFn = () => {
                    const details = card.closest('details');
                    if (details && !details.open) details.open = true;
                    if (typeof switchTab === 'function') switchTab('canva');
                    card.click();
                    this.addRecent(
                        'canva_' + cardId,
                        fullName,
                        type,
                        "const c = document.querySelector('.canva-tpl-card[data-id=\"" + cardId + "\"]'); if(c){ const d = c.closest('details'); if(d) d.open=true; if(typeof switchTab==='function') switchTab('canva'); c.click(); }"
                    );
                };

                addEntry(
                    'canva_' + cardId,
                    fullName,
                    type,
                    actionFn,
                    "const c = document.querySelector('.canva-tpl-card[data-id=\"" + cardId + "\"]'); if(c){ const d = c.closest('details'); if(d) d.open=true; if(typeof switchTab==='function') switchTab('canva'); c.click(); }"
                );
            }
        });

        // 3. İkonlar (trToEnMap ve kütüphane)
        const iconMap = window.trToEnMap || (typeof trToEnMap !== 'undefined' ? trToEnMap : null);
        if (iconMap && typeof iconMap === 'object') {
            Object.entries(iconMap).forEach(([trName, lucideKey]) => {
                const displayName = trName.charAt(0).toUpperCase() + trName.slice(1) + ' İkonu (' + trName + ')';
                addEntry(
                    'icon_' + lucideKey + '_' + trName,
                    displayName,
                    'İkon',
                    () => {
                        if (typeof switchTab === 'function') switchTab('icons');
                        if (typeof addIcon === 'function') addIcon(lucideKey);
                        this.addRecent('icon_' + lucideKey, displayName, 'İkon', "if(typeof switchTab==='function') switchTab('icons'); if(typeof addIcon==='function') addIcon('" + lucideKey + "');");
                    },
                    "if(typeof switchTab==='function') switchTab('icons'); if(typeof addIcon==='function') addIcon('" + lucideKey + "');"
                );
            });
        }

        // 4. Sistem Araçları & Modülleri
        const tools = [
            { id: 'tool_callout', name: 'Vurgu Rozeti Ekle', type: 'Araç', evalStr: "if(typeof switchTab === 'function') switchTab('callout'); if(typeof window.addCallout === 'function') window.addCallout();" },
            { id: 'tool_neon', name: 'Neon Rozet Ekle', type: 'Araç', evalStr: "if(typeof switchTab === 'function') switchTab('callout'); if(typeof window.addNeonCallout === 'function') window.addNeonCallout();" },
            { id: 'tool_text', name: 'Özel Çerçeveli Metin / Başlık Kutusu', type: 'Araç', evalStr: "if(typeof window.addCustomTextBox === 'function') window.addCustomTextBox();" },
            { id: 'tool_free_text', name: 'Serbest Yazı Ekle', type: 'Araç', evalStr: "if(typeof window.addCustomTextOnly === 'function') window.addCustomTextOnly();" },
            { id: 'tool_draw_free', name: 'Serbest Çizim (Kalem Modu)', type: 'Araç', evalStr: "if(typeof switchTab === 'function') switchTab('draw'); if(typeof setDrawMode === 'function') setDrawMode('free');" },
            { id: 'tool_draw_line', name: 'Ölçü / Düz Çizgi Çek', type: 'Araç', evalStr: "if(typeof switchTab === 'function') switchTab('draw'); if(typeof setDrawMode === 'function') setDrawMode('line');" },
            { id: 'tool_sat_map', name: 'Uydu Harita & Parsel Görseli Çek', type: 'Araç', evalStr: "if(typeof window.openSatelliteMapModal === 'function') window.openSatelliteMapModal();" },
            { id: 'tool_voiceover', name: 'Yapay Zeka Seslendirme Stüdyosu (AI Voiceover)', type: 'Araç', evalStr: "if(typeof window.openVoiceoverStudio === 'function') window.openVoiceoverStudio();" },
            { id: 'tool_ai_enhance', name: 'Yapay Zeka Fotoğraf İyileştirme & Filtreler', type: 'Araç', evalStr: "if(typeof switchTab === 'function') switchTab('photo');" },
            { id: 'tool_color_matcher', name: 'PRO Renk Paleti & Şablon Renk Eşleştirici', type: 'Araç', evalStr: "if(typeof showTemplateColorModal === 'function') showTemplateColorModal();" },
            { id: 'tool_layers', name: 'Katmanlar Paneli (Tüm Nesneleri Yönet)', type: 'Araç', evalStr: "if(typeof switchTab === 'function') switchTab('layers');" },
            { id: 'tool_qr', name: 'QR Kod Oluşturucu', type: 'Araç', evalStr: "if(typeof switchTab === 'function') switchTab('qr');" },
            { id: 'tool_font', name: 'Tipografi & Font Seçimi', type: 'Araç', evalStr: "if(typeof switchTab === 'function') switchTab('font');" },
            { id: 'tool_brand', name: 'Marka & Kurumsal Bilgiler', type: 'Araç', evalStr: "if(typeof switchTab === 'function') switchTab('brand');" },
            { id: 'tool_batch', name: 'Çıktı & Yüksek Çözünürlüklü İndirme', type: 'Araç', evalStr: "if(typeof switchTab === 'function') switchTab('batch');" }
        ];

        tools.forEach(t => {
            addEntry(
                t.id,
                t.name,
                t.type,
                () => {
                    try { eval(t.evalStr); } catch(e){ console.error(e); }
                    this.addRecent(t.id, t.name, t.type, t.evalStr);
                },
                t.evalStr
            );
        });

        this.searchIndex = newIndex;
        console.log('🔍 OmniSearch Index Güncellendi:', this.searchIndex.length, 'öğe');
    },

    positionBox: function(box) {
        if (!box) return;
        const btnContainer = document.getElementById('searchButtonsContainer');
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            box.style.top = '65px';
            box.style.left = '50%';
            box.style.transform = 'translateX(-50%)';
            box.style.width = 'calc(100% - 24px)';
            box.style.maxWidth = '420px';
            return;
        }

        if (btnContainer) {
            const rect = btnContainer.getBoundingClientRect();
            let width = Math.max(rect.width, 360);
            let left = rect.left;
            let top = rect.bottom + 6;

            // Clamp horizontal bounds
            if (left + width > window.innerWidth - 15) {
                left = Math.max(15, window.innerWidth - width - 15);
            }
            if (left < 15) left = 15;

            // Clamp vertical bounds
            if (top + 400 > window.innerHeight) {
                if (rect.top - 410 > 10) {
                    top = rect.top - 406;
                } else {
                    top = Math.max(15, window.innerHeight - 415);
                }
            }

            box.style.top = top + 'px';
            box.style.left = left + 'px';
            box.style.transform = 'none';
            box.style.width = width + 'px';
            box.style.maxWidth = '460px';
        } else {
            box.style.top = '80px';
            box.style.left = '50%';
            box.style.transform = 'translateX(-50%)';
            box.style.width = '380px';
        }
    },

    openSearch: function() {
        if (this.searchIndex.length === 0) {
            this.buildIndex();
        }

        const modal = document.getElementById('omniSearchModal');
        const box = document.getElementById('omniSearchBox');
        if (!modal || !box) return;

        modal.classList.add('active');
        modal.style.display = 'flex';
        this.positionBox(box);

        const input = document.getElementById('omniSearchInput');
        if (input) {
            input.value = '';
            this.performSearch('');
            setTimeout(() => input.focus(), 80);
        }
    },

    closeSearch: function() {
        const modal = document.getElementById('omniSearchModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    },

    performSearch: function(query) {
        const resultsContainer = document.getElementById('omniSearchResults');
        if (!resultsContainer) return;
        resultsContainer.innerHTML = '';
        
        const q = (query || '').toLocaleLowerCase('tr-TR').trim();
        
        if (!q) {
            resultsContainer.innerHTML = '<div style="color:#94a3b8; font-size:12px; text-align:center; padding:20px;">Aramak istediğiniz şablon, araç veya ikon adını yazın.</div>';
            return;
        }

        const results = this.searchIndex.filter(item => {
            const n = item.name.toLocaleLowerCase('tr-TR');
            const t = item.type.toLocaleLowerCase('tr-TR');
            return n.includes(q) || t.includes(q);
        });

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div style="color:#ef4444; font-size:12px; text-align:center; padding:20px;"><i class="fas fa-circle-exclamation" style="font-size:20px; display:block; margin-bottom:8px;"></i>Sonuç bulunamadı. Farklı bir kelime deneyebilirsiniz.</div>';
            return;
        }

        results.slice(0, 30).forEach(item => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-action';
            btn.style.cssText = 'background:#0f172a; border:1px solid #334155; color:#fff; text-align:left; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; border-radius:8px; cursor:pointer; transition:all 0.15s ease; width:100%;';
            
            btn.onmouseenter = () => {
                btn.style.background = '#1e293b';
                btn.style.borderColor = '#8b5cf6';
            };
            btn.onmouseleave = () => {
                btn.style.background = '#0f172a';
                btn.style.borderColor = '#334155';
            };

            let typeIcon = 'fa-wrench';
            let iconColor = '#8b5cf6';
            if (item.type.includes('Şablon') || item.type.includes('Kolaj')) {
                typeIcon = 'fa-layer-group';
                iconColor = '#3b82f6';
            } else if (item.type === 'İkon') {
                typeIcon = 'fa-star';
                iconColor = '#f59e0b';
            } else if (item.type === 'Araç') {
                typeIcon = 'fa-wand-magic-sparkles';
                iconColor = '#10b981';
            }

            const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const highlightedName = item.name.replace(new RegExp(escapedQ, 'gi'), match => "<span style='color:#38bdf8; font-weight:bold;'>" + match + "</span>");
            
            btn.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fas ${typeIcon}" style="color:${iconColor}; font-size:14px; width:16px; text-align:center;"></i>
                    <div style="display:flex; flex-direction:column; gap:2px;">
                        <span style="font-size:13px; font-weight:600; color:#f8fafc;">${highlightedName}</span>
                        <span style="font-size:10px; color:#94a3b8;">${item.type}</span>
                    </div>
                </div>
                <i class="fas fa-arrow-right" style="color:#64748b; font-size:11px;"></i>
            `;
            
            btn.onclick = (e) => {
                e.stopPropagation();
                this.closeSearch();
                try {
                    item.action();
                } catch(err) {
                    console.error('OmniSearch item action error:', err);
                }
            };
            resultsContainer.appendChild(btn);
        });
    },

    // --- RECENT TOOLS ---
    loadRecent: function() {
        try {
            this.recentTools = JSON.parse(localStorage.getItem('emlakstudiom_recent')) || [];
            if (!Array.isArray(this.recentTools)) this.recentTools = [];
        } catch(e) {
            this.recentTools = [];
        }
    },

    saveRecent: function() {
        try {
            localStorage.setItem('emlakstudiom_recent', JSON.stringify(this.recentTools));
        } catch(e){}
    },

    addRecent: function(id, name, type, evalStr) {
        if (!id || !name) return;
        this.recentTools = this.recentTools.filter(t => t.id !== id);
        this.recentTools.unshift({
            id: id,
            name: name,
            type: type || 'Araç',
            evalStr: evalStr || '',
            timestamp: Date.now()
        });
        
        if (this.recentTools.length > 12) {
            this.recentTools = this.recentTools.slice(0, 12);
        }
        this.saveRecent();
    },

    openRecent: function() {
        this.loadRecent();

        const modal = document.getElementById('recentToolsModal');
        const box = document.getElementById('recentToolsBox');
        if (!modal || !box) return;

        modal.classList.add('active');
        modal.style.display = 'flex';
        this.positionBox(box);

        this.renderRecent();
    },

    closeRecent: function() {
        const modal = document.getElementById('recentToolsModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    },

    renderRecent: function() {
        const list = document.getElementById('recentToolsList');
        if (!list) return;
        list.innerHTML = '';
        
        if (this.recentTools.length === 0) {
            list.innerHTML = '<div style="color:#94a3b8; font-size:12px; text-align:center; padding:25px 15px;"><i class="fas fa-clock-rotate-left" style="font-size:22px; color:#475569; display:block; margin-bottom:8px;"></i>Henüz son kullanılan araç veya şablon kaydı yok. Kullandığınız araçlar otomatik buraya eklenecektir.</div>';
            return;
        }

        this.recentTools.forEach(t => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-action';
            btn.style.cssText = 'background:#0f172a; border:1px solid #334155; color:#fff; text-align:left; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; border-radius:8px; cursor:pointer; transition:all 0.15s ease; width:100%;';
            
            btn.onmouseenter = () => {
                btn.style.background = '#1e293b';
                btn.style.borderColor = '#a855f7';
            };
            btn.onmouseleave = () => {
                btn.style.background = '#0f172a';
                btn.style.borderColor = '#334155';
            };

            let icon = 'fa-wand-magic-sparkles';
            let iconColor = '#8b5cf6';
            if (t.type && (t.type.includes('Şablon') || t.type.includes('Kolaj'))) {
                icon = 'fa-layer-group';
                iconColor = '#3b82f6';
            } else if (t.type === 'İkon') {
                icon = 'fa-star';
                iconColor = '#f59e0b';
            }

            btn.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fas ${icon}" style="color:${iconColor}; font-size:14px; width:16px; text-align:center;"></i>
                    <div style="display:flex; flex-direction:column; gap:2px;">
                        <span style="font-size:13px; font-weight:600; color:#f8fafc;">${t.name}</span>
                        <span style="font-size:10px; color:#94a3b8;">${t.type}</span>
                    </div>
                </div>
                <i class="fas fa-play" style="color:#64748b; font-size:10px;"></i>
            `;
            
            btn.onclick = (e) => {
                e.stopPropagation();
                this.closeRecent();
                if (t.evalStr) {
                    try {
                        eval(t.evalStr);
                        this.addRecent(t.id, t.name, t.type, t.evalStr);
                    } catch(err) {
                        console.error("Recent tool eval error:", err);
                    }
                }
            };
            list.appendChild(btn);
        });
    }
};

// Lifecycle initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.OmniSearch) window.OmniSearch.init();
    });
} else {
    if (window.OmniSearch) window.OmniSearch.init();
}

window.addEventListener('load', () => {
    if (window.OmniSearch) window.OmniSearch.init();
});
