// searchManager.js
// Handles OmniSearch and Recent Tools functionality

window.OmniSearch = {
    searchIndex: [],
    recentTools: [],

    init: function() {
        this.loadRecent();
        
        // We defer building the index slightly to ensure all DOM templates are loaded
        setTimeout(() => this.buildIndex(), 2000);
        
        const searchInput = document.getElementById('omniSearchInput');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => this.performSearch(e.target.value));
        }
    },

    buildIndex: function() {
        this.searchIndex = [];
        
        // 1. Standart Sablonlar
        document.querySelectorAll('#templateGrid .template-btn').forEach(btn => {
            const name = btn.textContent.trim().replace('★', '').replace('☆', '').trim();
            if (name) {
                this.searchIndex.push({
                    id: btn.id,
                    name: name,
                    type: 'Standart Şablon',
                    action: () => {
                        btn.click();
                        this.addRecent(btn.id, name, 'Standart Şablon', "document.getElementById('" + btn.id + "').click();");
                    }
                });
            }
        });

        // 2. Canva / Kolaj / vb. Gelismis Sablonlar
        document.querySelectorAll('.canva-tpl-card').forEach(card => {
            const titleEl = card.querySelector('.tpl-name');
            const tagEl = card.querySelector('.tpl-tag');
            const title = titleEl ? titleEl.textContent.trim() : 'Şablon';
            const tag = tagEl ? tagEl.textContent.trim() : '';
            const fullName = title + (tag ? " (" + tag + ")" : "");
            
            // Parent kategoriyi bul
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
            
            this.searchIndex.push({
                id: 'canva_' + card.dataset.id,
                name: fullName,
                type: type,
                action: () => {
                    const details = card.closest('details');
                    if (details && !details.open) details.open = true;
                    switchTab('data');
                    card.click();
                    this.addRecent('canva_' + card.dataset.id, fullName, type, "const c = document.querySelector('.canva-tpl-card[data-id=\"" + card.dataset.id + "\"]'); if(c){ const d = c.closest('details'); if(d) d.open=true; switchTab('data'); c.click(); }");
                }
            });
        });

        // 3. Ikonlar
        if (typeof allIcons !== 'undefined' && Array.isArray(allIcons)) {
            allIcons.forEach(icon => {
                if (!icon) return;
                const rawName = (typeof icon === 'string' ? icon : (icon.name || icon.dataset?.label || icon.textContent || '')) + '';
                if (!rawName) return;
                const name = rawName.replace(/-/g, ' ').toUpperCase();
                this.searchIndex.push({
                    id: 'icon_' + rawName,
                    name: name,
                    type: 'İkon',
                    action: () => {
                        if (typeof switchTab === 'function') switchTab('icon');
                        if (typeof addIcon === 'function') addIcon(rawName);
                        this.addRecent('icon_' + rawName, name, 'İkon', "switchTab('icon'); if(typeof addIcon === 'function') addIcon('" + rawName + "');");
                    }
                });
            });
        }

        // 4. Araclar
        const tools = [
            { id: 'tool_callout', name: 'Vurgu Rozeti Ekle', type: 'Araç', evalStr: "switchTab('callout'); if(typeof window.addCallout === 'function') window.addCallout();" },
            { id: 'tool_neon', name: 'Neon Rozet Ekle', type: 'Araç', evalStr: "switchTab('callout'); if(typeof window.addNeonCallout === 'function') window.addNeonCallout();" },
            { id: 'tool_text', name: 'Özel Çerçeveli Kutu / Metin Ekle', type: 'Araç', evalStr: "switchTab('text'); if(typeof window.addCustomTextBox === 'function') window.addCustomTextBox();" },
            { id: 'tool_free_text', name: 'Serbest Yazı Ekle', type: 'Araç', evalStr: "switchTab('text'); if(typeof window.addCustomTextOnly === 'function') window.addCustomTextOnly();" },
            { id: 'tool_draw_free', name: 'Serbest Çizim (Kalem)', type: 'Araç', evalStr: "switchTab('draw'); if(typeof setDrawMode === 'function') setDrawMode('free');" },
            { id: 'tool_draw_line', name: 'Ölçü / Düz Çizgi Çek', type: 'Araç', evalStr: "switchTab('draw'); if(typeof setDrawMode === 'function') setDrawMode('line');" },
            { id: 'tool_ai', name: 'Yapay Zeka (Arkaplan İyileştir / Filtre)', type: 'Araç', evalStr: "switchTab('photo');" },
            { id: 'tool_color_matcher', name: 'PRO Renk Paleti & Şablon Renk Eşleştirici', type: 'Araç', evalStr: "if(typeof showTemplateColorModal === 'function') showTemplateColorModal();" }
        ];

        tools.forEach(t => {
            this.searchIndex.push({
                id: t.id,
                name: t.name,
                type: t.type,
                action: () => {
                    eval(t.evalStr);
                    this.addRecent(t.id, t.name, t.type, t.evalStr);
                }
            });
        });
        
        console.log('🔍 OmniSearch Index Yüklendi:', this.searchIndex.length, 'öğe');
    },

    openSearch: function() {
        const modal = document.getElementById('omniSearchModal');
        const box = document.getElementById('omniSearchBox');
        modal.style.display = 'flex';
        
        const btnContainer = document.getElementById('searchButtonsContainer');
        if(btnContainer && box) {
            const rect = btnContainer.getBoundingClientRect();
            box.style.top = (rect.bottom + 5) + 'px';
            box.style.left = rect.left + 'px';
            box.style.width = rect.width + 'px';
            // left sidebar genelde 360px civari
        }
        
        const input = document.getElementById('omniSearchInput');
        input.value = '';
        this.performSearch('');
        setTimeout(() => input.focus(), 100);
    },

    closeSearch: function() {
        document.getElementById('omniSearchModal').style.display = 'none';
    },

    performSearch: function(query) {
        const resultsContainer = document.getElementById('omniSearchResults');
        resultsContainer.innerHTML = '';
        
        const q = query.toLowerCase().trim();
        
        if (!q) {
            resultsContainer.innerHTML = '<div style="color:#94a3b8; font-size:12px; text-align:center; padding:20px;">Aramak istediğiniz şablon veya aracın adını yazın.</div>';
            return;
        }

        const results = this.searchIndex.filter(item => {
            return item.name.toLowerCase().includes(q) || item.type.toLowerCase().includes(q);
        });

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div style="color:#ef4444; font-size:12px; text-align:center; padding:20px;">Sonuç bulunamadı.</div>';
            return;
        }

        results.slice(0, 30).forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'btn-action';
            btn.style.background = '#0f172a';
            btn.style.border = '1px solid #334155';
            btn.style.color = '#fff';
            btn.style.textAlign = 'left';
            btn.style.padding = '10px 15px';
            btn.style.display = 'flex';
            btn.style.justifyContent = 'space-between';
            btn.style.alignItems = 'center';
            
            const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const highlightedName = item.name.replace(new RegExp(escapedQ, 'gi'), match => "<span style='color:#00e5ff; font-weight:bold;'>" + match + "</span>");
            
            btn.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:3px;">
                    <span style="font-size:14px; font-weight:600;">` + highlightedName + `</span>
                    <span style="font-size:10px; color:#94a3b8;">` + item.type + `</span>
                </div>
                <i class="fas fa-chevron-right" style="color:#64748b;"></i>
            `;
            
            btn.onclick = () => {
                this.closeSearch();
                item.action();
            };
            resultsContainer.appendChild(btn);
        });
    },

    // --- RECENT TOOLS ---
    loadRecent: function() {
        try {
            this.recentTools = JSON.parse(localStorage.getItem('emlakstudiom_recent')) || [];
        } catch(e) {
            this.recentTools = [];
        }
    },

    saveRecent: function() {
        localStorage.setItem('emlakstudiom_recent', JSON.stringify(this.recentTools));
    },

    addRecent: function(id, name, type, evalStr) {
        this.recentTools = this.recentTools.filter(t => t.id !== id);
        this.recentTools.unshift({
            id: id,
            name: name,
            type: type,
            evalStr: evalStr,
            timestamp: Date.now()
        });
        
        if(this.recentTools.length > 10) {
            this.recentTools = this.recentTools.slice(0, 10);
        }
        this.saveRecent();
    },

    openRecent: function() {
        const modal = document.getElementById('recentToolsModal');
        const box = document.getElementById('recentToolsBox');
        modal.style.display = 'flex';
        
        const btnContainer = document.getElementById('searchButtonsContainer');
        if(btnContainer && box) {
            const rect = btnContainer.getBoundingClientRect();
            box.style.top = (rect.bottom + 5) + 'px';
            box.style.left = rect.left + 'px';
            box.style.width = rect.width + 'px';
        }
        
        this.renderRecent();
    },

    closeRecent: function() {
        document.getElementById('recentToolsModal').style.display = 'none';
    },

    renderRecent: function() {
        const list = document.getElementById('recentToolsList');
        list.innerHTML = '';
        
        if (this.recentTools.length === 0) {
            list.innerHTML = '<div style="color:#94a3b8; font-size:12px; text-align:center; padding:20px;">Henüz hiç araç kullanmadınız.</div>';
            return;
        }

        this.recentTools.forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'btn-action';
            btn.style.background = '#0f172a';
            btn.style.border = '1px solid #334155';
            btn.style.color = '#fff';
            btn.style.textAlign = 'left';
            btn.style.padding = '10px 15px';
            btn.style.display = 'flex';
            btn.style.justifyContent = 'space-between';
            btn.style.alignItems = 'center';
            
            let icon = 'fa-tools';
            if(t.type.includes('Şablon') || t.type.includes('Kolaj')) icon = 'fa-layer-group';
            else if(t.type === 'İkon') icon = 'fa-star';
            else if(t.type === 'Araç') icon = 'fa-wrench';

            btn.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fas ` + icon + `" style="color:#8b5cf6;"></i>
                    <div style="display:flex; flex-direction:column; gap:2px;">
                        <span style="font-size:13px; font-weight:600;">` + t.name + `</span>
                        <span style="font-size:10px; color:#94a3b8;">` + t.type + `</span>
                    </div>
                </div>
                <i class="fas fa-play" style="color:#64748b; font-size:10px;"></i>
            `;
            
            btn.onclick = () => {
                this.closeRecent();
                try {
                    eval(t.evalStr);
                    this.addRecent(t.id, t.name, t.type, t.evalStr);
                } catch(e) {
                    console.error("Recent tool eval error", e);
                }
            };
            list.appendChild(btn);
        });
    }
};

window.addEventListener('load', () => {
    if(window.OmniSearch) window.OmniSearch.init();
});
