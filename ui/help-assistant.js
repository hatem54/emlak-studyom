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
    hasSaberOnSelection: false,
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
    
    init: function() {
        try {
            // Check if disabled by user globally (future setting)
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
            this.addSystemMessage("Merhaba! 👋 EmlakStüdyom Akıllı Yardımcısına hoş geldiniz. Tasarım adımları ve tüm sorularınız için bana danışabilirsiniz:", [
                "📋 İşlem Sırası Nasıl Olmalı?", 
                "🏢 Logo & Fotoğraf Sırası", 
                "🖌️ Çizim & Parsel Nasıl Yapılır?",
                "⚡ Neon Işık Efekti",
                "❓ SSS & Tüm Kılavuz"
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
                <h4 class="ha-header-title">✨ Akıllı Yardımcı & SSS</h4>
                <button class="ha-close-btn" onclick="HelpAssistant.togglePanel()">✖</button>
            </div>
            <div class="ha-body" id="ha-chat-body"></div>
            <div class="ha-footer">
                <input type="text" class="ha-input" id="ha-input" placeholder="Bir soru sorun veya işlem sırası yazın..." onkeypress="if(event.key==='Enter') HelpAssistant.handleUserInput()">
                <button class="ha-send-btn" onclick="HelpAssistant.handleUserInput()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
        `;
        
        this.panelEl.innerHTML = html;
        document.body.appendChild(this.panelEl);

        this.chatBodyEl = document.getElementById('ha-chat-body');
        this.inputEl = document.getElementById('ha-input');
    },

    togglePanel: function() {
        const state = window.helpAssistantState;
        state.isOpen = !state.isOpen;
        
        if (state.isOpen) {
            this.panelEl.classList.add('open');
            this.fabEl.classList.remove('has-notification');
            this.inputEl.focus();
            // Scroll to bottom
            this.chatBodyEl.scrollTop = this.chatBodyEl.scrollHeight;
        } else {
            this.panelEl.classList.remove('open');
        }
    },

    addSystemMessage: function(text, suggestions = [], actionBtn = null) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'ha-message system';
        msgDiv.innerHTML = text;

        if (actionBtn) {
            const btn = document.createElement('button');
            btn.className = 'ha-action-btn';
            btn.innerText = actionBtn.label;
            btn.onclick = actionBtn.onClick;
            msgDiv.appendChild(document.createElement('br'));
            msgDiv.appendChild(btn);
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
        
        // Save history
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
        
        // Disable input briefly
        this.inputEl.disabled = true;
        
        // Simulate processing time
        setTimeout(() => {
            this.processIntent(val);
            this.inputEl.disabled = false;
            this.inputEl.focus();
        }, 400);
    },

    // --- CONTEXT COLLECTION ---
    collectContext: function() {
        const state = window.helpAssistantState;
        
        // 1. Active Tab
        const activeTabBtn = document.querySelector('#mainTabs .tab-btn.active');
        state.activeTab = activeTabBtn ? activeTabBtn.getAttribute('data-tab') : 'bilinmiyor';

        // 2. Photo loaded
        const photoEl = document.getElementById('photoLayer');
        state.hasPhoto = (photoEl && photoEl.src && photoEl.src.length > 100 && photoEl.style.display !== 'none');

        // 3. Selection state (Draw / Saber engine)
        state.hasSelectedText = false;
        state.hasSelectedPath = false;
        state.hasSaberOnSelection = false;

        if (typeof window.selectedLineId !== 'undefined' && window.selectedLineId !== null) {
            state.hasSelectedPath = true;
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
    },

    // --- INTENT ENGINE ---
    processIntent: async function(query) {
        try {
            this.collectContext();
            const state = window.helpAssistantState;
            const q = query.toLowerCase();
            
            // 🤖 1. CANLI GOOGLE GEMINI AI'YA SOR
            const workerUrl = 'https://small-lab-3110.emlakstudyomtr.workers.dev';
            
            const typingDiv = document.createElement('div');
            typingDiv.className = 'ha-message system thinking';
            typingDiv.id = 'ha-thinking-indicator';
            typingDiv.innerHTML = '<span style="display:inline-flex; align-items:center; gap:6px; color:#818cf8; font-size:12px;"><i class="fa-solid fa-wand-magic-sparkles fa-spin"></i> <em>Google Gemini AI Yanıtlıyor...</em></span>';
            this.chatBodyEl.appendChild(typingDiv);
            this.chatBodyEl.scrollTop = this.chatBodyEl.scrollHeight;

            let liveAiAnswer = null;
            try {
                const res = await fetch(workerUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'chat',
                        prompt: `Sen EmlakStüdyom'un Akıllı Emlak ve Tasarım Danışmanısın. Kullanıcının sorusuna Türkçe, samimi, detaylı, emojili, profesyonel emlak ve tasarım tavsiyeleriyle yanıt ver:\n\nKullanıcı Sorusu: ${query}`,
                        text: query
                    })
                });
                const data = await res.json();
                if (data.success && data.data) {
                    liveAiAnswer = data.data.reply || data.data.description;
                }
            } catch(e) {
                console.warn('HelpAssistant AI çağrısı hatası:', e);
            }

            const tEl = document.getElementById('ha-thinking-indicator');
            if (tEl) tEl.remove();

            if (liveAiAnswer && typeof liveAiAnswer === 'string' && liveAiAnswer.length > 5 && !liveAiAnswer.startsWith('{')) {
                this.addSystemMessage(liveAiAnswer.replace(/\n/g, '<br>'));
                return;
            }

            let answer = "";
            let actionBtn = null;
            let suggestions = [];

            // 0. İŞLEM SIRASI & STANDART AKIŞ (REHBER)
            if (q.includes("sıra") || q.includes("sırayla") || q.includes("adım") || q.includes("nasıl yapılır") || q.includes("nereden başlayayım") || q.includes("akış") || q.includes("workflow") || q.includes("işlem")) {
                answer = `<b>📋 Tavsiye Edilen Standart İşlem Sırası:</b><br><br>
                <b>1️⃣ Giriş:</b> İlan metnini yapıştırıp <i>'🤖 Metni Süz'</i> butonuna basın.<br>
                <b>2️⃣ Fotoğraf:</b> Ana gayrimenkul fotoğrafınızı yükleyin (tuval otomatik orana ayarlanır).<br>
                <b>3️⃣ Logo:</b> Varsa firma logonuzu yükleyin ve istediğiniz köşeye sürükleyin.<br>
                <b>4️⃣ Rozet & İkonlar:</b> İlana özel hazırlanan rozetleri veya grafik ikonları tuvale ekleyin.<br>
                <b>5️⃣ Çizim / Parsel:</b> Arsa sınırlarını çizgiyle belirleyin veya ölçü okları ekleyin.<br>
                <b>6️⃣ Neon Işık Efekti:</b> Önemli yazı veya çizgileri neon parlaklığıyla öne çıkarın.<br>
                <b>7️⃣ Katmanlar:</b> <i>'Katmanlar'</i> panelinden öğelerinizi düzenleyin veya kilitleyin.<br>
                <b>8️⃣ Çıktı:</b> <i>'Çıktı'</i> sekmesinden HD/4K olarak cihazınıza indirin.`;
                actionBtn = { label: "Giriş Sekmesine Git", onClick: () => window.switchTab('data') };
                suggestions = ["🏢 Logo & Fotoğraf Sırası", "🖌️ Çizim nasıl yapılır?", "📑 Katmanlar nasıl yönetilir?"];
            }

            // 1. LOGO & GÖRSEL İLİŞKİSİ / SIRASI
            else if (q.includes("logo") || q.includes("firma logo") || q.includes("üstte") || q.includes("arkada")) {
                answer = `<b>🏢 Firma Logosu ve Görsel Kuralları:</b><br><br>
                • <b>Sıra Fark Etmez:</b> Önce logo sonra fotoğraf ya da önce fotoğraf sonra logo yükleyebilirsiniz. Logonuz <b>daima fotoğrafın en üst katmanında</b> yer alır.<br>
                • <b>Düzenleme:</b> Logoya tıklayarak serbestçe taşıyabilir, köşesindeki tutamaçlardan boyutlandırabilir ve döndürebilirsiniz.<br>
                • <b>Seçim Kolaylığı:</b> Logoyu doğrudan tuvalden veya <b>Katmanlar</b> panelindeki <i>'Firma Logosu'</i> satırına tıklayarak seçebilirsiniz.`;
                actionBtn = { label: "Katmanlar Paneline Git", onClick: () => window.switchTab('layers') };
                suggestions = ["📋 İşlem Sırası Nasıl Olmalı?", "Rozet nasıl eklenir?"];
            }

            // 2. KATMANLAR PANELİ & SEÇİM
            else if (q.includes("katman") || q.includes("layer") || q.includes("seçilmiyor") || q.includes("kilit") || q.includes("gizle")) {
                answer = `<b>📑 Katmanlar Paneli Kullanımı:</b><br><br>
                • Tuval üzerindeki tüm elemanlar (Fotoğraf, Logo, Yazılar, Rozetler, Çizimler) Katmanlar panelinde listelenir.<br>
                • <b>Seçim:</b> Listeden bir elemana tıkladığınızda tuval üzerinde o eleman mavi çerçeveyle seçilir.<br>
                • <b>👁️ Gizle / Göster:</b> Geçici olarak bir elemanı gizleyip açabilirsiniz.<br>
                • <b>🔒 Kilitle:</b> Yanlışlıkla kaymasını istemediğiniz elemanları sabitleyebilirsiniz.`;
                actionBtn = { label: "Katmanlar Sekmesine Git", onClick: () => window.switchTab('layers') };
                suggestions = ["📋 İşlem Sırası Nasıl Olmalı?", "Çizim nasıl yapılır?"];
            }

            // 3. ÇALIŞMAYI GERİ YÜKLEME & KAYIT
            else if (q.includes("geri yükle") || q.includes("kaydet") || q.includes("kayıt") || q.includes("yenile") || q.includes("taslak")) {
                answer = `<b>💾 Otomatik Kayıt & Geri Yükleme:</b><br><br>
                • EmlakStüdyom yaptığınız tüm çizim, metin ve görsel değişikliklerini tarayıcınıza anlık olarak kaydeder.<br>
                • Sayfayı yenilediğinizde üst bardaki <b>'♻️ Çalışmayı Geri Yükle'</b> butonuna basarak tüm çalışmanızı kaldığınız yerden eksiksiz devam ettirebilirsiniz.`;
                suggestions = ["📋 İşlem Sırası Nasıl Olmalı?", "Çıktı nasıl alınır?"];
            }

            // 4. METNİ SÜZ & AKILLI AYRIŞTIRICI
            else if (q.includes("süz") || q.includes("metin") || q.includes("sahibinden") || q.includes("ilan") || q.includes("yapıştır")) {
                answer = "Sahibinden veya WhatsApp ilan metninizi kopyalayıp <b>Giriş</b> sekmesindeki kutuya yapıştırın ve <b>'🤖 Metni Süz'</b> butonuna basın. Fiyat, m², ada/parsel vb. tüm veriler ve hazır rozetler otomatik üretilir.";
                actionBtn = { label: "Giriş Sekmesine Git", onClick: () => window.switchTab('data') };
                suggestions = ["Rozet nasıl eklenir?", "Fotoğraf nasıl yüklenir?"];
            }

            // 5. FOTO YÜKLEME & KADRAJ
            else if (q.includes("foto") || q.includes("resim") || q.includes("yükle") || q.includes("kadraj") || q.includes("oran")) {
                if (state.hasPhoto) {
                    answer = "Şu anda bir fotoğraf yüklü. <b>Fotoğraf</b> sekmesinden 16:9, 1:1, 4:5, 9:16 oranlarını ayarlayabilir, zoom veya renk filtreleri uygulayabilirsiniz.";
                    actionBtn = { label: "Fotoğraf Ayarlarına Git", onClick: () => window.switchTab('photo') };
                } else {
                    answer = "Tasarım yapabilmek için <b>Giriş</b> sekmesinden arka plan fotoğrafı seçebilir veya tuvale sürükleyip bırakabilirsiniz.";
                    actionBtn = { label: "Fotoğraf Yükle (Giriş)", onClick: () => window.switchTab('data') };
                }
                suggestions = ["📋 İşlem Sırası Nasıl Olmalı?", "Metin nasıl süzülür?"];
            }
            
            // 6. ROZETLER & İKONLAR
            else if (q.includes("rozet") || q.includes("etiket") || q.includes("ikon") || q.includes("badge")) {
                answer = "İlanınızı süzdükten sonra <b>Giriş</b> sekmesinin altında ilana özel hazırlanan akıllı rozetleri veya <b>Rozetler</b> sekmesindeki grafik rozet ve etiketleri tuvale tek tıkla ekleyebilirsiniz.";
                actionBtn = { label: "Rozetler Sekmesine Git", onClick: () => window.switchTab('callout') };
                suggestions = ["Yazı nasıl eklenir?", "Çıktı nasıl alınır?"];
            }

            // 7. PARSEL / ÇİZİM
            else if (q.includes("çizim") || q.includes("çizgi") || q.includes("parsel") || q.includes("alan") || q.includes("sınır") || q.includes("ölçü")) {
                answer = `<b>🖌️ Parsel & Çizim Rehberi:</b><br><br>
                1. <b>Çizim</b> sekmesine geçin ve <i>'Çokgen / Alan'</i> veya <i>'Ölçü Oku'</i> aracını seçin.<br>
                2. Tuval üzerinde köşe noktalarına tıklayarak sınırı belirleyin.<br>
                3. Çift tıklayarak veya <i>'Şekli Kapat'</i> butonuna basarak alanı otomatik doldurun.<br>
                4. Renk, opaklık veya neon parlaklık efektini sağ panelden dilediğiniz gibi özelleştirin.`;
                actionBtn = { label: "Çizim Sekmesine Git", onClick: () => window.switchTab('draw') };
                suggestions = ["⚡ Neon Işık Efekti", "📋 İşlem Sırası"];
            }

            // 8. NEON IŞIK EFEKTİ
            else if (q.includes("neon") || q.includes("parlak") || q.includes("saber") || q.includes("ışık") || q.includes("yanmıyor")) {
                if (!state.hasSelectedText && !state.hasSelectedPath) {
                    answer = "Neon ışık efektini uygulayabilmek için **önce ekrandan bir yazıya veya çizgiye tıklayıp seçmeniz** gerekir. Şu an hiçbir obje seçili değil.";
                    suggestions = ["Yazı nasıl eklenir?", "Çizgi nasıl çizilir?"];
                } else if (state.hasSaberOnSelection) {
                    answer = "Seçili objede zaten Neon efekti aktif görünüyor! Eğer parlamayı göremiyorsanız efekt panelinden **Işık Şiddeti (Intensity)** veya **Parlama (Glow Size)** ayarını artırmayı deneyin.";
                } else {
                    if (state.hasSelectedText) {
                        answer = "Bir yazı seçtiniz! Neon efekti vermek için sol menüden **Neon Efekti Aktif** kutucuğunu işaretleyin.";
                    } else if (state.hasSelectedPath) {
                        answer = "Bir çizgi seçtiniz! Sağ menüden **Neon Efekti Aktif** kutucuğunu işaretleyerek neon görünümü verebilirsiniz.";
                    }
                }
            }

            // 9. ŞABLONLAR & KOLAJ
            else if (q.includes("şablon") || q.includes("tasarım") || q.includes("kolaj") || q.includes("instagram")) {
                answer = "<b>Şablonlar</b> sekmesinde Instagram Post, Story, Vitrin ve Portföy için özel tasarlanmış profesyonel şablonları tek tıkla tuvale uygulayabilirsiniz.";
                actionBtn = { label: "Şablonlar Sekmesine Git", onClick: () => window.switchTab('canva') };
                suggestions = ["Çıktı nasıl alınır?", "Rozet nasıl eklenir?"];
            }

            // 10. YAZI EKLEME
            else if (q.includes("yazı") || q.includes("metin") || q.includes("text")) {
                answer = "Üst menüdeki **Yazı Ekle** veya **Çerçeveli Yazı** butonlarını kullanarak tuvale metin ekleyebilir, çift tıklayarak içeriğini değiştirebilirsiniz.";
                actionBtn = { label: "Yazı Ekle", onClick: () => window.addCustomTextOnly() };
                suggestions = ["Yazıya neon nasıl eklenir?", "Yazı rengi nasıl değişir?"];
            }

            // 11. ÇIKTI / İNDİRME
            else if (q.includes("çıktı") || q.includes("indir") || q.includes("export") || q.includes("4k")) {
                answer = "<b>Çıktı</b> sekmesinden tasarımınızı HD veya 4K kalitesinde JPEG veya PNG olarak tek tıkla indirebilirsiniz.";
                actionBtn = { label: "Çıktı Sekmesine Git", onClick: () => window.switchTab('batch') };
            }

            // 12. SSS (GENEL LİSTE)
            else if (q.includes("sss") || q.includes("faq") || q.includes("kılavuz") || q.includes("yardım")) {
                answer = `<b>❓ Sıkça Sorulan Sorular (SSS) Rehberi:</b><br><br>
                Aşağıdaki popüler konu başlıklarına tıklayarak doğrudan adım adım çözüm alabilirsiniz:`;
                suggestions = ["📋 İşlem Sırası Nasıl Olmalı?", "🏢 Logo & Fotoğraf Sırası", "🖌️ Çizim & Parsel Nasıl Yapılır?", "⚡ Neon Işık Efekti", "💾 Çalışmayı Geri Yükleme"];
            }

            // DEFAULT -> DOĞRUDAN GEMINI AI VEYA DOĞAL DİL MOTORU
            else {
                // Eğer Gemini API Key varsa önce canlı Gemini'ye sor
                if (typeof window.callDirectGeminiChat === 'function' && window.getGeminiApiKey()) {
                    const loadingDiv = document.createElement('div');
                    loadingDiv.className = 'ha-message system';
                    loadingDiv.id = 'ha-ai-loading';
                    loadingDiv.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles fa-spin" style="color:#8b5cf6;"></i> <strong>Google Gemini yanıt hazırlıyor...</strong>`;
                    this.chatBodyEl.appendChild(loadingDiv);
                    this.chatBodyEl.scrollTop = this.chatBodyEl.scrollHeight;

                    window.callDirectGeminiChat(query).then(geminiReply => {
                        const l = document.getElementById('ha-ai-loading');
                        if (l) l.remove();
                        const finalReply = geminiReply || window.generateLocalAiAssistantResponse(query);
                        this.addSystemMessage(finalReply.replace(/\n/g, '<br>'), [
                            "✍️ İlan Başlığı Nasıl Yazılır?",
                            "💰 Fiyat Rozeti Nereye Konur?",
                            "📱 Instagram Paylaşım Saatleri",
                            "🌾 Arsa Afişi Püf Noktaları",
                            "📋 İşlem Sırası Nasıl Olmalı?"
                        ]);
                    }).catch(() => {
                        const l = document.getElementById('ha-ai-loading');
                        if (l) l.remove();
                        const finalReply = window.generateLocalAiAssistantResponse(query);
                        this.addSystemMessage(finalReply.replace(/\n/g, '<br>'), [
                            "✍️ İlan Başlığı Nasıl Yazılır?",
                            "💰 Fiyat Rozeti Nereye Konur?",
                            "📱 Instagram Paylaşım Saatleri"
                        ]);
                    });
                    return;
                }

                // API Key yoksa anlık zengin yerel NLP danışmanını çalıştır
                const aiReply = (typeof window.generateLocalAiAssistantResponse === 'function')
                    ? window.generateLocalAiAssistantResponse(query)
                    : `Merhaba! 😊 Sorunuzla ilgili olarak sol menüdeki <b>'📝 Giriş'</b>, <b>'🎨 Şablonlar'</b> ve <b>'🏷️ Rozetler'</b> sekmelerini kullanabilir veya hazır rehber konularımızdan dilediğinizi seçebilirsiniz.`;

                this.addSystemMessage(aiReply, [
                    "✍️ İlan Başlığı Nasıl Yazılır?",
                    "💰 Fiyat Rozeti Nereye Konur?",
                    "📱 Instagram Paylaşım Saatleri",
                    "🌾 Arsa Afişi Püf Noktaları",
                    "📋 İşlem Sırası Nasıl Olmalı?"
                ]);
                return;
            }

        } catch(e) {
            console.error("Assistant process error:", e);
            this.addSystemMessage("Üzgünüm, şu an sistemde geçici bir hata var. Lütfen daha sonra tekrar sorun.");
        }
    },

    // --- GELECEK AI API HAZIRLIĞI ---
    buildAssistantContext: function() {
        // This function prepares a JSON payload that can be sent to ChatGPT or Claude in the future.
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
