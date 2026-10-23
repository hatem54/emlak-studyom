/**
 * ============================================
 * AKILLI YARDIMCI (SMART ASSISTANT)
 * ui/help-assistant.js
 * ============================================
 * 
 * Amaç: Kullanıcının uygulamadaki mevcut durumunu okuyup sorunlarına mantıklı çözümler üretmek.
 * Sürekli çalışan observer kullanılmamıştır, sadece chat esnasında anlık (event-based) okuma yapar.
 */

window.helpAssistantState = {
    isOpen: false,
    isEnabled: true,
    lastQuestion: "",
    lastAnswer: "",
    activeTab: "",
    hasPhoto: false,
    hasSelectedPath: false,
    hasSelectedText: false,
    hasSelected3D: false,
    hasSaberOnSelection: false,
    isTemplateApplied: false,
    canvasRatio: "1:1",
    selectedPreset: "",
    exportAttemptCount: 0,
    lastKnownIssue: "",
    userPlan: "free",
    conversationHistory: [],
    dismissedHints: []
};

const HelpAssistant = {
    fabEl: null,
    panelEl: null,
    chatBodyEl: null,
    inputEl: null,
    voiceBtnEl: null,
    _recognition: null,
    _isListening: false,
    
    init: function() {
        try {
            const enabled = localStorage.getItem('emlakstudiom_help_enabled');
            if (enabled === 'false') {
                window.helpAssistantState.isEnabled = false;
                return;
            }

            // Track errors silently to give better context
            window.addEventListener('error', (e) => {
                window.helpAssistantState.lastKnownIssue = e.message || "Bilinmeyen JS Hatası";
            });

            this.createUI();
            this.addSystemMessage("Merhaba! EmlakStüdyom Akıllı Yardımcısına hoş geldiniz. Tasarım adımları, 3D stüdyo, TKGM parsel, neon çerçeve ve tüm sorularınız için bana danışabilirsiniz:", [
                "İşlem Sırası Nasıl Olmalı?", 
                "3D Stüdyo & Katı Silüet",
                "Uydu & TKGM Parsel",
                "Şablon Neon Çerçevesi",
                "AI Netleştirme & Silgi",
                "SSS & Tüm Kılavuz"
            ]);

        } catch(e) {
            console.error("Help Assistant init error:", e);
        }
    },

    createUI: function() {
        // Floating Action Button
        this.fabEl = document.createElement('div');
        this.fabEl.className = 'help-assistant-fab';
        this.fabEl.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles" style="font-size:16px;"></i>';
        this.fabEl.title = "Akıllı Yardımcı & SSS";
        this.fabEl.onclick = () => this.togglePanel();
        document.body.appendChild(this.fabEl);

        // Chat Panel
        this.panelEl = document.createElement('div');
        this.panelEl.className = 'help-assistant-panel';
        
        let html = `
            <div class="ha-header">
                <h4 class="ha-header-title"><i class="fa-solid fa-wand-magic-sparkles" style="color:#00e5ff; margin-right:6px;"></i>Akıllı Yardımcı & SSS</h4>
                <button class="ha-close-btn" onclick="HelpAssistant.togglePanel()">✕</button>
            </div>
            <div class="ha-body" id="ha-chat-body"></div>
            <div class="ha-footer">
                <input type="text" class="ha-input" id="ha-input" placeholder="Bir soru sorun veya işlem sırası yazın..." onkeypress="if(event.key==='Enter') HelpAssistant.handleUserInput()">
                <button type="button" class="ha-voice-btn" id="haVoiceBtn" title="Sesli Komut Ver" onclick="HelpAssistant.toggleVoiceRecognition()">
                    <i class="fa-solid fa-microphone"></i>
                </button>
                <button type="button" class="ha-send-btn" onclick="HelpAssistant.handleUserInput()" title="Gönder">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
        `;
        
        this.panelEl.innerHTML = html;
        document.body.appendChild(this.panelEl);

        this.chatBodyEl = document.getElementById('ha-chat-body');
        this.inputEl = document.getElementById('ha-input');
        this.voiceBtnEl = document.getElementById('haVoiceBtn');
    },

    togglePanel: function() {
        const state = window.helpAssistantState;
        state.isOpen = !state.isOpen;
        
        if (state.isOpen) {
            this.panelEl.classList.add('open');
            this.fabEl.classList.remove('has-notification');
            if (this.inputEl) this.inputEl.focus();
            if (this.chatBodyEl) this.chatBodyEl.scrollTop = this.chatBodyEl.scrollHeight;
        } else {
            this.panelEl.classList.remove('open');
            if (this._isListening && this._recognition) {
                this._recognition.stop();
            }
        }
    },

    toggleVoiceRecognition: function() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Tarayıcınız ses tanıma özelliğini desteklemiyor. Lütfen Google Chrome veya Edge kullanın.");
            return;
        }
        
        const voiceBtn = document.getElementById('haVoiceBtn');
        if (this._recognition && this._isListening) {
            this._recognition.stop();
            return;
        }
        
        try {
            const recognition = new SpeechRecognition();
            recognition.lang = 'tr-TR';
            recognition.continuous = false;
            recognition.interimResults = false;
            
            recognition.onstart = () => {
                this._isListening = true;
                if (voiceBtn) voiceBtn.classList.add('recording');
                if (this.inputEl) this.inputEl.placeholder = "Dinliyorum, konuşun...";
            };
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (this.inputEl && transcript) {
                    this.inputEl.value = transcript;
                    this.handleUserInput();
                }
            };
            
            recognition.onerror = (e) => {
                console.warn("Speech recognition error:", e);
                if (voiceBtn) voiceBtn.classList.remove('recording');
                if (this.inputEl) this.inputEl.placeholder = "Bir soru sorun veya işlem sırası yazın...";
                this._isListening = false;
            };
            
            recognition.onend = () => {
                this._isListening = false;
                if (voiceBtn) voiceBtn.classList.remove('recording');
                if (this.inputEl) this.inputEl.placeholder = "Bir soru sorun veya işlem sırası yazın...";
            };
            
            this._recognition = recognition;
            recognition.start();
        } catch(err) {
            console.error("Speech recognition start failed:", err);
            if (voiceBtn) voiceBtn.classList.remove('recording');
        }
    },

    addSystemMessage: function(text, suggestions = [], actionBtns = null) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'ha-message system';
        msgDiv.innerHTML = text;

        if (actionBtns) {
            const actionsRow = document.createElement('div');
            actionsRow.className = 'ha-actions-row';
            const btns = Array.isArray(actionBtns) ? actionBtns : [actionBtns];
            btns.forEach(btnInfo => {
                if (btnInfo && btnInfo.label && btnInfo.onClick) {
                    const btn = document.createElement('button');
                    btn.className = 'ha-action-btn';
                    btn.innerText = btnInfo.label;
                    btn.onclick = () => {
                        try { btnInfo.onClick(); } catch(err){ console.error(err); }
                    };
                    actionsRow.appendChild(btn);
                }
            });
            msgDiv.appendChild(actionsRow);
        }

        if (suggestions && suggestions.length > 0) {
            const suggDiv = document.createElement('div');
            suggDiv.className = 'ha-suggestions';
            suggestions.forEach(s => {
                const b = document.createElement('button');
                b.className = 'ha-sugg-btn';
                b.innerText = s;
                b.onclick = () => {
                    this.inputEl.value = s;
                    this.handleUserInput();
                };
                suggDiv.appendChild(b);
            });
            msgDiv.appendChild(suggDiv);
        }

        this.chatBodyEl.appendChild(msgDiv);
        this.chatBodyEl.scrollTop = this.chatBodyEl.scrollHeight;
        
        window.helpAssistantState.conversationHistory.push({ role: 'system', text: text });
    },

    addUserMessage: function(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'ha-message user';
        msgDiv.innerText = text;
        this.chatBodyEl.appendChild(msgDiv);
        this.chatBodyEl.scrollTop = this.chatBodyEl.scrollHeight;
        
        window.helpAssistantState.conversationHistory.push({ role: 'user', text: text });
        window.helpAssistantState.lastQuestion = text;
    },

    handleUserInput: function() {
        const val = this.inputEl.value.trim();
        if (!val) return;
        
        this.addUserMessage(val);
        this.inputEl.value = '';
        this.inputEl.disabled = true;
        
        setTimeout(() => {
            this.processIntent(val);
            this.inputEl.disabled = false;
            this.inputEl.focus();
        }, 350);
    },

    // --- CONTEXT COLLECTION ---
    collectContext: function() {
        const state = window.helpAssistantState;
        
        // 1. Active Tab
        const activeTabBtn = document.querySelector('#mainTabs .tab-btn.active');
        state.activeTab = activeTabBtn ? activeTabBtn.getAttribute('data-tab') : 'bilinmiyor';

        // 2. Photo loaded
        const photoEl = document.getElementById('photoLayer');
        state.hasPhoto = !!(photoEl && photoEl.src && photoEl.src.length > 100 && photoEl.style.display !== 'none');

        // 3. Selection state (Draw / Saber / 3D)
        state.hasSelectedText = false;
        state.hasSelectedPath = false;
        state.hasSelected3D = false;
        state.hasSaberOnSelection = false;

        if (typeof window.selectedLineId !== 'undefined' && window.selectedLineId !== null) {
            state.hasSelectedPath = true;
        }

        if (window.ThreeDEngine && typeof window.ThreeDEngine.hasSelectedElement === 'function') {
            state.hasSelected3D = window.ThreeDEngine.hasSelectedElement();
        }

        if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
            const app = window.SaberEngine.getApp();
            if (app && app.selectedId) {
                state.hasSelectedText = true;
                if (app.textObjects && app.textObjects[app.selectedId]) {
                    const obj = app.textObjects[app.selectedId];
                    if (obj.saberData && obj.saberData.active) {
                        state.hasSaberOnSelection = true;
                    }
                }
            }
        }
        
        const elTextSaber = document.getElementById('elTextSaber');
        const deSaberToggle = document.getElementById('deSaberToggle');
        if ((elTextSaber && elTextSaber.checked) || (deSaberToggle && deSaberToggle.checked)) {
            state.hasSaberOnSelection = true;
        }

        // 4. Template State
        state.isTemplateApplied = !!(window.activeTemplateId && window.activeTemplateId !== 'none');
        
        // 5. Canvas Ratio
        const activeRatioBtn = document.querySelector('.ratio-btn.active, .dock-ratio-btn.active');
        state.canvasRatio = activeRatioBtn ? activeRatioBtn.innerText.trim() : '1:1';
    },

    // --- INTENT ENGINE ---
    processIntent: async function(query) {
        try {
            this.collectContext();
            const state = window.helpAssistantState;
            const q = query.toLowerCase();

            // 0. DOĞRUDAN GEMINI AI ARAMASI
            const workerUrl = 'https://small-lab-3110.emlakstudyomtr.workers.dev';
            
            // Belirli kritik teknik konular yerel zengin motorla anında karşılanır
            const isLocalPriority = q.includes("3d") || q.includes("katı") || q.includes("silüet") || 
                                    q.includes("çerçeve") || q.includes("tkgm") || q.includes("uydu") || 
                                    q.includes("netleştir") || q.includes("silgi") || q.includes("ekstra") || 
                                    q.includes("sıra") || q.includes("adım") || q.includes("kurtar") || q.includes("geri yükle");

            if (!isLocalPriority) {
                const typingDiv = document.createElement('div');
                typingDiv.className = 'ha-message system thinking';
                typingDiv.id = 'ha-thinking-indicator';
                typingDiv.innerHTML = '<span style="display:inline-flex; align-items:center; gap:6px; color:#38bdf8; font-size:12px;"><i class="fa-solid fa-wand-magic-sparkles fa-spin"></i> <em>Google Gemini Danışman Yanıtlıyor...</em></span>';
                this.chatBodyEl.appendChild(typingDiv);
                this.chatBodyEl.scrollTop = this.chatBodyEl.scrollHeight;

                let liveAiAnswer = null;
                try {
                    if (typeof window.callDirectGeminiChat === 'function') {
                        liveAiAnswer = await window.callDirectGeminiChat(query);
                    } else {
                        const res = await fetch(workerUrl, {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'X-Emlak-Client': 'emlak-studiom-v7'
                            },
                            body: JSON.stringify({
                                action: 'chat',
                                prompt: `Sen EmlakStüdyom'un Akıllı Emlak ve Tasarım Danışmanısın. Kullanıcının sorusuna Türkçe, samimi, detaylı, profesyonel emlak ve tasarım tavsiyeleriyle yanıt ver:\n\nKullanıcı Sorusu: ${query}`,
                                text: query
                            })
                        });
                        const data = await res.json();
                        if (data.success && data.data) {
                            liveAiAnswer = data.data.reply || data.data.description;
                        }
                    }
                } catch(e) {
                    console.warn('HelpAssistant AI çağrısı hatası:', e);
                }

                const tEl = document.getElementById('ha-thinking-indicator');
                if (tEl) tEl.remove();

                if (liveAiAnswer && typeof liveAiAnswer === 'string' && liveAiAnswer.length > 5 && !liveAiAnswer.startsWith('{')) {
                    this.addSystemMessage(liveAiAnswer.replace(/\n/g, '<br>'), [
                        "İşlem Sırası Nasıl Olmalı?",
                        "3D Stüdyo & Katı Silüet",
                        "Şablon Neon Çerçevesi",
                        "AI Netleştirme & Silgi"
                    ]);
                    return;
                }
            }

            // 1. 3D STÜDYO & KATI SİLÜET
            if (q.includes("3d") || q.includes("katı") || q.includes("silüet") || q.includes("kabartma") || q.includes("üç boyut")) {
                const answer = `<b>🧊 3D Stüdyo & Katı Silüet (Solid Extrusion):</b><br><br>
                • <b>3D Metin:</b> Yazılarınıza 3 boyutlu derinlik, bevel (pah), gölge ve altın/krom materyalleri kazandırabilirsiniz.<br>
                • <b>Katı Silüet:</b> İkon kütüphanesinden eklediğiniz tüm simgeleri tek tıkla 3D heykelimsi kabartmaya dönüştürebilirsiniz.<br>
                • <b>Işık & Açı:</b> Sağ panelden ışık yönünü, zemin hizalamasını ve kamera açısını serbestçe ayarlayın.`;
                const actionBtns = [
                    { label: "3D Stüdyoyu Aç", onClick: () => { if(window.ThreeDEngine) window.ThreeDEngine.openStudio(); } },
                    { label: "3D Metin Ekle", onClick: () => { if(window.ThreeDEngine) window.ThreeDEngine.add3DText(); } }
                ];
                this.addSystemMessage(answer, ["Şablon Neon Çerçevesi", "Uydu & TKGM Parsel", "İşlem Sırası Nasıl Olmalı?"], actionBtns);
                return;
            }

            // 2. ŞABLON DIŞ ÇERÇEVE NEON ÇİZGİSİ
            if (q.includes("çerçeve") || q.includes("kenarlık") || q.includes("neon çerçeve") || q.includes("dış çizgi") || q.includes("frame")) {
                const answer = `<b>🎨 Şablon Dış Çerçeve Neon Çizgisi:</b><br><br>
                • <b>Açma / Kapama:</b> Şablonlar sekmesinde bir şablon seçtiğinizde üst kısımda <i>'Neon Dış Çerçeve'</i> anahtarı belirir.<br>
                • <b>Renk & Parlaklık:</b> İlanınıza en uygun rengi (Neon Cyan, Altın Sarısı, Zümrüt Yeşili vb.) seçebilir, parlamayı ve kalınlığı kırpılma olmadan ayarlayabilirsiniz.`;
                const actionBtns = [
                    { label: "Şablonlar Sekmesine Git", onClick: () => window.switchTab('canva') }
                ];
                this.addSystemMessage(answer, ["3D Stüdyo & Katı Silüet", "⚡ Neon Işık Efekti", "İşlem Sırası Nasıl Olmalı?"], actionBtns);
                return;
            }

            // 3. UYDU & TKGM PARSEL SORGULAMA & EĞİM
            if (q.includes("uydu") || q.includes("tkgm") || q.includes("parsel") || q.includes("harita") || q.includes("eğim") || q.includes("kadastro") || q.includes("ada")) {
                const answer = `<b>🛰️ Uydu & TKGM Parsel Sistemi:</b><br><br>
                • <b>Otomatik Sınır Çizimi:</b> İl, ilçe, ada ve parsel numarasını girerek resmi kadastro sınırlarını uydu görüntüsü üzerine anında aktarın.<br>
                • <b>Uydu Katmanları:</b> Esri ve Google uydu haritaları arasında geçiş yapabilirsiniz.<br>
                • <b>3D Perspektif & Eğim (Pitch):</b> Araziye açılı kuşbakışı derinlik verin ve arsanın m² ile çevre uzunluğunu otomatik hesaplatın.`;
                const actionBtns = [
                    { label: "TKGM Parsel Haritasını Aç", onClick: () => { if(typeof window.openSatelliteMapModal === 'function') window.openSatelliteMapModal(); } }
                ];
                this.addSystemMessage(answer, ["Çizim & Parsel Nasıl Yapılır?", "3D Stüdyo & Katı Silüet", "İşlem Sırası Nasıl Olmalı?"], actionBtns);
                return;
            }

            // 4. YAPAY ZEKA (AI) NETLEŞTİRME & SİHİRLİ SİLGİ
            if (q.includes("netleştir") || q.includes("bulanık") || q.includes("silgi") || q.includes("nesne sil") || q.includes("magic eraser") || q.includes("kalite artır")) {
                const answer = `<b>🪄 Yapay Zeka Fotoğraf & Silgi Araçları:</b><br><br>
                • <b>AI Netleştirme (Super-Resolution):</b> Fotoğraf sekmesindeki netleştirme kaydırıcısını artırarak düşük kaliteli veya pikselli görselleri keskinleştirin.<br>
                • <b>Sihirli Silgi (Magic Eraser):</b> Fotoğraftaki istenmeyen nesneleri (araba, kablo, çöp, insan) fırçayla boyayın; yapay zeka dokuyu arkasındaki zeminle pürüzsüzce doldurur.`;
                const actionBtns = [
                    { label: "Fotoğraf & AI Sekmesine Git", onClick: () => window.switchTab('photo') }
                ];
                this.addSystemMessage(answer, ["3D Stüdyo & Katı Silüet", "Şablon Neon Çerçevesi", "İşlem Sırası Nasıl Olmalı?"], actionBtns);
                return;
            }

            // 5. EKSTRA ARAÇLAR (BÜYÜTEÇ, ODAK, IŞIK HÜZMESİ, ÇEVRE ANALİZİ)
            if (q.includes("ekstra") || q.includes("büyüteç") || q.includes("ışık hüzmesi") || q.includes("odak") || q.includes("vurgu") || q.includes("çevre analiz") || q.includes("cetvel")) {
                const answer = `<b>🧰 Ekstra Araçlar & Görsel Efektler:</b><br><br>
                • <b>Büyüteç:</b> Fotoğraftaki önemli bir detayı (villa kapısı, havuz vb.) dairesel lens ile yakınlaştırarak gösterir.<br>
                • <b>Işık Hüzmesi:</b> Görselinize güneş ışığı huzmesi veya gün batımı atmosferi katar.<br>
                • <b>Odak / Vurgu:</b> Ana yapıyı net bırakıp arka planı flulaştırarak dikkati konuta çeker.<br>
                • <b>Çevre Analizi:</b> Sahile 500m, Okula 1km gibi lokasyon mesafelerini otomatik ok ve pimlerle işaretler.`;
                const actionBtns = [
                    { label: "Ekstra Araçlar Sekmesine Git", onClick: () => window.switchTab('settings') }
                ];
                this.addSystemMessage(answer, ["3D Stüdyo & Katı Silüet", "Uydu & TKGM Parsel", "İşlem Sırası Nasıl Olmalı?"], actionBtns);
                return;
            }

            // 6. KATMANLAR & ÇOKLU SEÇİM
            if (q.includes("katman") || q.includes("layer") || q.includes("çoklu") || q.includes("hizala") || q.includes("grup") || q.includes("kilit") || q.includes("gizle")) {
                const answer = `<b>📑 Katmanlar & Çoklu Nesne Yönetimi:</b><br><br>
                • Tuvaldeki tüm nesneler (Fotoğraf, Logo, 3D Metinler, Rozetler, Çizimler) Katmanlar panelinde listelenir.<br>
                • <b>Çoklu Seçim:</b> Klavyeden <code>Ctrl</code> veya <code>Shift</code> tuşuna basarak birden fazla nesneyi aynı anda seçebilir, tek tıkla yatay/dikey ortalayabilir veya gruplayabilirsiniz.<br>
                • <b>Kilitleme:</b> Yanlışlıkla kaymasını istemediğiniz ögeleri sabitleyebilirsiniz.`;
                const actionBtns = [
                    { label: "Katmanlar Paneline Git", onClick: () => window.switchTab('layers') }
                ];
                this.addSystemMessage(answer, ["İşlem Sırası Nasıl Olmalı?", "3D Stüdyo & Katı Silüet"], actionBtns);
                return;
            }

            // 7. ÇALIŞMAYI GERİ YÜKLEME & OTO-KAYIT
            if (q.includes("geri yükle") || q.includes("kaydet") || q.includes("kurtar") || q.includes("çöktü") || q.includes("taslak") || q.includes("yenile")) {
                const answer = `<b>💾 Otomatik Kayıt & Çalışmayı Kurtarma:</b><br><br>
                • EmlakStüdyom yaptığınız tüm çizim, 3D nesne ve şablon düzenlemelerini anlık olarak tarayıcınızın yerel hafızasına kaydeder.<br>
                • Sayfayı yenilediğinizde veya yanlışlıkla kapattığınızda üst menüdeki <b>'Çalışmayı Geri Yükle'</b> butonuna basarak tüm çalışmanızı eksiksiz kurtarabilirsiniz.`;
                const actionBtns = [
                    { label: "Çalışmayı Geri Yükle", onClick: () => { if(typeof window.restoreAutoSaveDraft === 'function') window.restoreAutoSaveDraft(); } }
                ];
                this.addSystemMessage(answer, ["İşlem Sırası Nasıl Olmalı?", "Çıktı nasıl alınır?"], actionBtns);
                return;
            }

            // 8. İŞLEM SIRASI (GÜNCELLENMİŞ 9 ADIM)
            if (q.includes("sıra") || q.includes("sırayla") || q.includes("adım") || q.includes("nasıl yapılır") || q.includes("nereden başlayayım") || q.includes("akış") || q.includes("workflow") || q.includes("işlem")) {
                const answer = `<b>📋 Tavsiye Edilen Standart İşlem Sırası:</b><br><br>
                <b>1️⃣ Giriş:</b> İlan metnini yapıştırıp <i>'Metni Süz'</i> butonuna basın.<br>
                <b>2️⃣ Fotoğraf:</b> Görselinizi yükleyin ve AI Netleştirme ile netleştirin.<br>
                <b>3️⃣ 3D Stüdyo:</b> Başlığınıza veya simgelere 3D Katı Silüet derinliği kazandırın.<br>
                <b>4️⃣ Uydu / Parsel:</b> Arsa ilanlarında TKGM'den sınırları çekin.<br>
                <b>5️⃣ Şablon:</b> En uygun şablonu seçip Neon Dış Çerçeveyi açın.<br>
                <b>6️⃣ Rozet & İkonlar:</b> Fiyat ve tapu rozetlerini tuvale ekleyin.<br>
                <b>7️⃣ Ekstra Araçlar:</b> Büyüteç veya ışık hüzmesiyle ilanı zenginleştirin.<br>
                <b>8️⃣ Katmanlar:</b> Nesneleri hizalayın veya kilitleyin.<br>
                <b>9️⃣ Çıktı:</b> HD veya 4K olarak cihazınıza indirin.`;
                const actionBtns = [
                    { label: "Giriş Sekmesine Git", onClick: () => window.switchTab('data') }
                ];
                this.addSystemMessage(answer, ["3D Stüdyo & Katı Silüet", "Uydu & TKGM Parsel", "Şablon Neon Çerçevesi"], actionBtns);
                return;
            }

            // 9. LOGO & FOTOĞRAF
            if (q.includes("logo") || q.includes("firma logo") || q.includes("üstte") || q.includes("arkada")) {
                const answer = `<b>🏢 Firma Logosu ve Görsel Kuralları:</b><br><br>
                • <b>Sıra Fark Etmez:</b> Önce logo sonra fotoğraf ya da tam tersi yükleyebilirsiniz. Logonuz <b>daima fotoğrafın en üst katmanında</b> yer alır.<br>
                • <b>Düzenleme:</b> Logoya tıklayarak serbestçe taşıyabilir, köşesindeki tutamaçlardan boyutlandırabilir ve döndürebilirsiniz.<br>
                • <b>Seçim Kolaylığı:</b> Katmanlar panelindeki <i>'Firma Logosu'</i> satırından kolayca seçebilirsiniz.`;
                const actionBtns = [
                    { label: "Katmanlar Paneline Git", onClick: () => window.switchTab('layers') }
                ];
                this.addSystemMessage(answer, ["İşlem Sırası Nasıl Olmalı?", "Rozet nasıl eklenir?"], actionBtns);
                return;
            }

            // 10. METNİ SÜZ
            if (q.includes("süz") || q.includes("metin") || q.includes("sahibinden") || q.includes("ilan") || q.includes("yapıştır")) {
                const answer = "Sahibinden veya WhatsApp ilan metninizi kopyalayıp <b>Giriş</b> sekmesindeki kutuya yapıştırın ve <b>'Metni Süz'</b> butonuna basın. Fiyat, m², ada/parsel bilgileri ve ilana özel 5 grafik rozet otomatik üretilir.";
                const actionBtns = [
                    { label: "Giriş Sekmesine Git", onClick: () => window.switchTab('data') }
                ];
                this.addSystemMessage(answer, ["Rozet nasıl eklenir?", "Fotoğraf nasıl yüklenir?"], actionBtns);
                return;
            }

            // 11. ROZETLER & İKONLAR
            if (q.includes("rozet") || q.includes("etiket") || q.includes("ikon") || q.includes("badge")) {
                const answer = "İlanınızı süzdükten sonra çıkan akıllı rozetleri veya <b>Rozetler</b> ve <b>İkon</b> sekmelerindeki 100+ sektörel ikonu tek tıkla tuvale ekleyebilirsiniz. İkonları seçip 3D Stüdyo'da tek tıkla katı kabartmaya dönüştürebilirsiniz.";
                const actionBtns = [
                    { label: "Rozetler Sekmesine Git", onClick: () => window.switchTab('callout') },
                    { label: "İkon Kütüphanesine Git", onClick: () => window.switchTab('icons') }
                ];
                this.addSystemMessage(answer, ["3D Stüdyo & Katı Silüet", "Yazı nasıl eklenir?"], actionBtns);
                return;
            }

            // 12. ÇIKTI / İNDİRME
            if (q.includes("çıktı") || q.includes("indir") || q.includes("export") || q.includes("4k")) {
                const answer = "<b>Çıktı</b> sekmesinden tasarımınızı Instagram Post (1:1), Story (9:16), Web (16:9) formatlarında HD veya 4K kalitesinde tek tıkla indirebilirsiniz.";
                const actionBtns = [
                    { label: "Çıktı Sekmesine Git", onClick: () => window.switchTab('batch') }
                ];
                this.addSystemMessage(answer, ["İşlem Sırası Nasıl Olmalı?", "Şablon Neon Çerçevesi"], actionBtns);
                return;
            }

            // 13. SSS (GENEL LİSTE)
            if (q.includes("sss") || q.includes("faq") || q.includes("kılavuz") || q.includes("yardım")) {
                const answer = `<b>❓ Sıkça Sorulan Sorular (SSS) Rehberi:</b><br><br>
                Aşağıdaki popüler konu başlıklarına tıklayarak doğrudan adım adım çözüm alabilir veya sorunuzu sesli/yazılı sorabilirsiniz:`;
                this.addSystemMessage(answer, [
                    "3D Stüdyo & Katı Silüet",
                    "Şablon Neon Çerçevesi",
                    "Uydu & TKGM Parsel",
                    "AI Netleştirme & Silgi",
                    "Ekstra Araçlar & Efektler",
                    "İşlem Sırası Nasıl Olmalı?"
                ]);
                return;
            }

            // DEFAULT
            const fallbackReply = (typeof window.generateLocalAiAssistantResponse === 'function')
                ? window.generateLocalAiAssistantResponse(query)
                : `Merhaba! Sorunuzla ilgili olarak sol menüdeki araçları kullanabilir veya aşağıdaki hazır rehber konularından dilediğinizi seçebilirsiniz:`;

            this.addSystemMessage(fallbackReply, [
                "3D Stüdyo & Katı Silüet",
                "Şablon Neon Çerçevesi",
                "Uydu & TKGM Parsel",
                "İşlem Sırası Nasıl Olmalı?"
            ]);

        } catch(e) {
            console.error("Assistant process error:", e);
            this.addSystemMessage("Üzgünüm, şu an sistemde geçici bir hata var. Lütfen daha sonra tekrar deneyin.");
        }
    },

    buildAssistantContext: function() {
        this.collectContext();
        return JSON.stringify({
            appState: window.helpAssistantState,
            timestamp: new Date().toISOString()
        });
    }
};

window.HelpAssistant = HelpAssistant;

// Init when safe
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => { HelpAssistant.init(); });
} else {
    HelpAssistant.init();
}