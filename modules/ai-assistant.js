/**
 * ============================================================================
 * 🤖 AKILLI EMLAK DANIŞMANI (DIRECT GOOGLE GEMINI + CONVERSATIONAL ENGINE)
 * modules/ai-assistant.js
 * ============================================================================
 */

(function(window) {
    'use strict';

    const AI_WORKER_URL = 'https://small-lab-3110.emlakstudyomtr.workers.dev';
    
    // Gömülü Gemini API Anahtarı (İsteğe bağlı doğrudan buraya yazılabilir)
    const BUILTIN_GEMINI_API_KEY = '';

    // ==================== GEMINI API KEY YÖNETİMİ ====================
    window.getGeminiApiKey = function() {
        return BUILTIN_GEMINI_API_KEY || localStorage.getItem('emlakstudiom_gemini_api_key') || '';
    };

    window.setGeminiApiKey = function(key) {
        if (!key || !key.trim()) {
            localStorage.removeItem('emlakstudiom_gemini_api_key');
            return false;
        }
        localStorage.setItem('emlakstudiom_gemini_api_key', key.trim());
        return true;
    };

    window.testGeminiApiKey = async function(key) {
        const apiKey = key || window.getGeminiApiKey();
        if (!apiKey) return { success: false, message: 'API Anahtarı girilmedi.' };

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'Merhaba Gemini, sadece "TAMAM" yaz.' }] }],
                    generationConfig: { maxOutputTokens: 10 }
                })
            });
            const data = await res.json();
            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                return { success: true, message: 'Gemini API bağlantısı başarılı!' };
            } else if (data.error) {
                return { success: false, message: data.error.message || 'API Hatası oluştu.' };
            }
            return { success: false, message: 'Geçersiz API yanıtı.' };
        } catch (err) {
            return { success: false, message: err.message || 'Bağlantı hatası.' };
        }
    };

    // ==================== KOTA & GÜVENLİK KORUMASI (BOT & HARİCİ KULLANIMI ENGELLEME) ====================
    window.checkAiQuota = function() {
        const isPro = (window.SubscriptionManager && typeof window.SubscriptionManager.isPro === 'function' && window.SubscriptionManager.isPro()) || localStorage.getItem('isAdmin') === 'true' || localStorage.getItem('es_is_pro') === 'true';
        if (isPro) return { allowed: true, remaining: 'Sınırsız (Admin/Pro)', isPro: true };

        const today = new Date().toISOString().slice(0, 10);
        const usageKey = 'es_ai_chat_usage_' + today;
        const currentCount = parseInt(localStorage.getItem(usageKey) || '0', 10);
        const MAX_FREE_DAILY = 25;

        if (currentCount >= MAX_FREE_DAILY) {
            return { allowed: false, remaining: 0, max: MAX_FREE_DAILY, isPro: false };
        }
        return { allowed: true, remaining: MAX_FREE_DAILY - currentCount, max: MAX_FREE_DAILY, isPro: false };
    };

    window.consumeAiChatQuota = function() {
        const isPro = (window.SubscriptionManager && typeof window.SubscriptionManager.isPro === 'function' && window.SubscriptionManager.isPro()) || localStorage.getItem('isAdmin') === 'true' || localStorage.getItem('es_is_pro') === 'true';
        if (isPro) return true;

        const today = new Date().toISOString().slice(0, 10);
        const usageKey = 'es_ai_chat_usage_' + today;
        const currentCount = parseInt(localStorage.getItem(usageKey) || '0', 10);
        localStorage.setItem(usageKey, (currentCount + 1).toString());
        return true;
    };

    // ==================== CANLI GEMINI CALL (CHAT) ====================
    let lastChatTimestamp = 0;

    window.callDirectGeminiChat = async function(userPrompt) {
        // 1. Spam ve Bot Koruması (3 saniye Cooldown)
        const now = Date.now();
        if (now - lastChatTimestamp < 2500) {
            return "⏳ Lütfen art arda hızlı istek göndermeyiniz, birkaç saniye bekleyin.";
        }
        lastChatTimestamp = now;

        // 2. Kota Kontrolü
        const quota = window.checkAiQuota();
        if (!quota.allowed) {
            return "⚠️ Günlük ücretsiz AI Danışmanlık limitinize (25 soru) ulaştınız. Kotanız yarın gece sıfırlanacaktır. Sınırsız erişim için Pro üyeliğe geçebilirsiniz. 💎";
        }

        const apiKey = window.getGeminiApiKey();
        const systemPrompt = "Sen profesyonel bir Emlak Danışmanlığı, Sosyal Medya Pazarlaması ve EmlakStüdyom Tasarım Koçusun. SADECE gayrimenkul, emlak pazarlaması, ilan yazarlığı ve afiş tasarımı ile ilgili sorulara Türkçe, samimi ve emojili cevap ver. Emlak dışı alakasız sorulara cevap verme.";
        const fullPrompt = `${systemPrompt}\n\nKullanıcı Sorusu:\n${userPrompt}`;

        if (apiKey) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: fullPrompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
                    })
                });
                const data = await res.json();
                if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                    return data.candidates[0].content.parts[0].text;
                }
            } catch (e) {
                console.warn('Gemini doğrudan API çağrısı hatası:', e);
            }
        }

        try {
            const res = await fetch(AI_WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: fullPrompt, text: userPrompt, action: 'chat' })
            });
            const data = await res.json();
            if (data.success && data.data) {
                window.consumeAiChatQuota();
                if (data.data.reply) return data.data.reply;
                if (data.data.description && typeof data.data.description === 'string' && !data.data.description.startsWith('{')) {
                    return data.data.description;
                }
            }
        } catch (e) {
            // Cloudflare worker hatası
        }

        return null;
    };

    // 🌟 KAPSAMLI DOĞAL DİL EMLAK DANIŞMANI MOTORU (LOCAL NLP ENGINE)
    window.generateLocalAiAssistantResponse = function(question) {
        const raw = (question || '').trim();
        const q = raw.toLowerCase();

        // 1. Selamlaşma, Hal-Hatır & Samimi Sohbet
        if (/^(nasılsın|naber|ne haber|nasilsin|nasıl gidiyor|iyi misin|keyifler nasıl|nabıyon|nörüyon|naber ya|nasılsın canım|nasılsın yapay zeka)/i.test(q)) {
            return `Harikayım, çok teşekkür ederim! 😊 Sizin enerjiniz nasıl?<br><br>Bugün hangi portföyünüz için tasarım hazırlıyoruz? Arsa, daire veya villa afişiniz için <b>etkili ilan başlığı</b>, <b>fiyat rozeti yerleşimi</b> veya <b>şablon seçimi</b> konusunda size memnuniyetle yardımcı olabilirim! 🚀`;
        }

        if (/^(selam|merhaba|günaydın|iyi günler|iyi akşamlar|tünaydın|selamlar|merhabalar|hey|sa|selamün aleyküm|selamun aleykum)/i.test(q)) {
            return `Merhaba! 👋 Hoş geldiniz! Ben EmlakStüdyom Akıllı Danışmanınızım.<br><br>Bugün size nasıl yardımcı olabilirim?<br>• ✍️ <b>İlan Başlığı & Instagram Metni Yazdırma</b><br>• 💰 <b>Fiyat & Grafik Rozet Yerleşim Taktikleri</b><br>• 🌾 <b>Arsa, Tarla, Konut ve Villa Pazarlama Tavsiyeleri</b><br>• 🎨 <b>Şablon & Çizim Araçları Rehberi</b>`;
        }

        if (/^(teşekkür|sağ ol|sağol|eyvallah|harikasın|süpersin|eline sağlık|çok iyi|tamamdır|eyv|harika|süper|teşekkür ederim|teşekkürler)/i.test(q)) {
            return `Rica ederim, her zaman yanınızdayım! 🌟<br><br>Portföyünüzün en hızlı ve en karlı şekilde alıcı bulmasını dilerim. Tasarımınızı tamamlamak için sol menüdeki <b>'🎨 Şablonlar'</b> veya <b>'📥 Çıktı'</b> sekmesini kullanabilirsiniz. Bol satışlar ve hayırlı işler! 🤝`;
        }

        if (/^(kimsin|sen kimsin|ne işe yararsın|ne yapabilirsin|sen nesin|görevin ne|sen kimsin ya)/i.test(q)) {
            return `Ben EmlakStüdyom'un <strong>Akıllı Emlak ve Tasarım Danışmanıyım</strong>! 🤖<br><br><b>Sizin için yapabileceklerim:</b><br>1️⃣ <strong>İlan Süzme:</strong> Sahibinden metinlerinizi süzüp fiyat, m², ada/parsel bilgilerini çıkarırım.<br>2️⃣ <strong>Grafik Rozetler:</strong> İlan bilgilerinize özel 5 grafik rozet hazırlarım.<br>3️⃣ <strong>Metin Yazarlığı:</strong> Tıklanan ilan başlıkları ve hashtag'li Instagram açıklamaları üretirim.<br>4️⃣ <strong>Tasarım & Pazarlama Koçluğu:</strong> En uygun şablonu, renk kombinasyonunu ve en yüksek etkileşim alan paylaşım saatlerini söylerim.`;
        }

        // 2. İlan Başlığı & Slogan & Metin Yazımı
        if (q.includes('başlık') || q.includes('slogan') || q.includes('tık') || q.includes('başlık öner') || q.includes('ne yazmalı') || q.includes('yazı öner')) {
            return `✍️ <strong>Tıklama Rekoru Kıran İlan Başlığı Formülü:</strong><br><br>` +
                   `📌 <strong>Altın Formül:</strong> <code>[Lokasyon / Bölge] + [Tip / m²] + [En Vurucu 2 Özellik] + [Fırsat / Durum]</code><br><br>` +
                   `🌾 <strong>Arsa / Tarla Örnekleri:</strong><br>` +
                   `• <em>'Çanakkale Gelibolu Tayfurköy'de 21.271 m² Kadastro Yollu Müstakil Tarla'</em><br>` +
                   `• <em>'Gelişim Aksında Köy Merkezine 800m Yatırımlık Fırsat Arazi'</em><br><br>` +
                   `🏢 <strong>Konut / Daire Örnekleri:</strong><br>` +
                   `• <em>'Kadıköy Moda Caddesi Yanı Sıfır Lüks 3+1 Yerden Isıtmalı Daire'</em><br>` +
                   `• <em>'Merkezi Konumda Geniş Balkonlu Masrafsız Fırsat Konut'</em><br><br>` +
                   `💡 <em>İpucu:</em> İlan metninizi sol paneldeki <strong>'🤖 Metni Süz'</strong> kutusuna yapıştırdığınızda başlık ve açıklamalarınız otomatik üretilir!`;
        }

        // 3. Instagram, Reels & Sosyal Medya Pazarlaması
        if (q.includes('instagram') || q.includes('reels') || q.includes('paylaş') || q.includes('saat') || q.includes('sosyal medya') || q.includes('etkileşim') || q.includes('format') || q.includes('boyut')) {
            return `📱 <strong>Sosyal Medya ve Instagram Emlak Başarı Stratejisi:</strong><br><br>` +
                   `⏰ <strong>En Çok Etkileşim Alan Paylaşım Saatleri:</strong><br>` +
                   `• <strong>Hafta İçi:</strong> 12:30 - 14:00 (Öğle molası) & 19:30 - 21:30 (Akşam dinlenme)<br>` +
                   `• <strong>Pazar Günü:</strong> 11:00 - 15:00 (Arsa, tarla ve yazlık arayanların zirve saati)<br><br>` +
                   `📐 <strong>En Doğru Görsel Boyutları:</strong><br>` +
                   `• <strong>Post / Gönderi:</strong> 1:1 Kare (1080x1080) veya 4:5 Dikey (1080x1350) akışta en çok yeri kaplar.<br>` +
                   `• <strong>Story & Reels:</strong> 9:16 Dikey (1080x1920).<br><br>` +
                   `🎬 <strong>Reels Tavsiyesi:</strong> İlk 3 saniyede fiyatı veya en vurucu özelliği (örn: 'Denize 3 km Müstakil Tarla') gösteren rozetimizi kapak yapın!`;
        }

        // 4. Fiyat Rozeti & Renk & Tasarım Yerleşimi
        if (q.includes('fiyat') || q.includes('rozet') || q.includes('nereye') || q.includes('konum') || q.includes('yerleşim') || q.includes('renk') || q.includes('koy')) {
            return `💰 <strong>Fiyat ve Grafik Rozet Yerleşim Kuralları:</strong><br><br>` +
                   `1. <strong>Sol Alt Köşe (Önerilen):</strong> Göz soldan sağa okur; kurumsal ve profesyonel afişlerde fiyat en çok sol alta yerleştirilir.<br>` +
                   `2. <strong>Sağ Üst Köşe:</strong> Fotoğraftaki ana yapıyı (bina cephesi, deniz veya havuz) kapatmayacak şekilde çok etkilidir.<br>` +
                   `3. <strong>Kontrast & Renk:</strong><br>` +
                   `• Koyu/Yeşil zeminlerde: <strong>Altın Sarısı (Gold)</strong> veya <strong>Neon Yeşil</strong> rozetlerimizi tercih edin.<br>` +
                   `• Açık/Güneşli zeminlerde: <strong>Koyu Lacivert</strong> veya <strong>Kırmızı</strong> rozetlerimizi kullanın.<br>` +
                   `4. <strong>Altın Kural:</strong> Rozeti binanın ana kapısının, penceresinin veya parselin tam ortasına değil, açık gökyüzü/yol boşluklarına koyun.`;
        }

        // 5. Arsa, Tarla, İmar & Tapu Bilgileri
        if (q.includes('arsa') || q.includes('tarla') || q.includes('parsel') || q.includes('ada') || q.includes('imar') || q.includes('tapu') || q.includes('kadastro') || q.includes('hisse')) {
            return `🌾 <strong>Arsa & Arazi Alıcılarının İlk Baktığı 4 Bilgi:</strong><br><br>` +
                   `1️⃣ <strong>Ada / Parsel:</strong> Alıcılar Parsel Sorgu'dan kontrol etmek ister. Görselde mutlaka <strong>Ada/Parsel Rozeti</strong> olsun.<br>` +
                   `2️⃣ <strong>İmar & Nitelik:</strong> Tarla, Zeytinlik, Konut İmarlı veya Ticari İmarlı olduğu net belirtilmelidir.<br>` +
                   `3️⃣ <strong>Müstakil / Hisseli:</strong> 'Müstakil Tek Tapu' ibaresi arsanın değerini ve alıcı güvenini %40 artırır.<br>` +
                   `4️⃣ <strong>Yol & Ulaşım:</strong> Resmi kadastro yolu olan arazilerde 'Kadastro Yollu' rozetimizi mutlaka ekleyin.<br><br>` +
                   `💡 <em>İpucu:</em> İlanınızı süzdükten sonra çıkan 5 grafik rozetten 'Müstakil Parsel' ve 'Ada/Parsel' rozetlerine tıklayarak tek tıkla tuvalinize ekleyin.`;
        }

        // 6. Villa & Lüks Konut
        if (q.includes('villa') || q.includes('lüks') || q.includes('havuz') || q.includes('müstakil ev') || q.includes('yazlık')) {
            return `🏡 <strong>Lüks Villa ve Müstakil Konut Sunumu:</strong><br><br>` +
                   `• <strong>Öne Çıkarılacak Rozetler:</strong> 'Özel Havuzlu', 'Müstakil Bahçeli', 'Akıllı Ev', 'Deniz Manzaralı'.<br>` +
                   `• <strong>Fotoğraf Seçimi:</strong> Gün batımı, aydınlatmalı havuz başı veya geniş açı salon çekimleri kapak yapılmalıdır.<br>` +
                   `• <strong>Şablon:</strong> 'Şablonlar' sekmesinden <strong>'👑 Lüks Villa Prestij'</strong> veya <strong>'💎 Elit VIP Müstakil'</strong> şablonunu seçin.`;
        }

        // 7. Uygulama Araçları & Kullanım Adımları
        if (q.includes('fotoğraf') || q.includes('resim') || q.includes('çizim') || q.includes('saber') || q.includes('çıktı') || q.includes('indir') || q.includes('katman') || q.includes('nasıl')) {
            return `🛠️ <strong>EmlakStüdyom Hızlı Kullanım Adımları:</strong><br><br>` +
                   `1. <strong>📸 Fotoğraf Yükle:</strong> Sol üstteki 'Fotoğraf Seç / Yükle' butonuyla ana görselinizi tuvale oturtun.<br>` +
                   `2. <strong>🤖 Metni Süz:</strong> İlan açıklamasını yapıştırıp 'Metni Süz'e basın; fiyat, m², ada/parsel ve hazır 5 grafik rozet anında üretilsin.<br>` +
                   `3. <strong>🎨 Şablon & Rozet:</strong> İlana en uygun şablonu ve rozetleri tek tıkla tuvale uygulayın.<br>` +
                   `4. <strong>⚡ Saber (Neon):</strong> Çizgi veya yazılara tıklayıp Saber parlaklığı verin.<br>` +
                   `5. <strong>📥 Çıktı Al:</strong> 'Çıktı' sekmesinden Instagram Post (1:1), Story (9:16) veya Web (16:9) Ultra HD indirin!`;
        }

        // 8. Genel Emlak Danışmanlığı
        return `🎯 <strong>Akıllı Emlak Danışmanı Yanıtı:</strong><br><br>` +
               `Sorunuzla ilgili olarak size en etkili emlak tavsiyeleri:<br><br>` +
               `• <strong>Görsel Önceliği:</strong> Alıcıların %80'i ilk 2 saniyede kapak görselindeki fiyat, lokasyon ve vurucu özelliğe bakar.<br>` +
               `• <strong>Akıllı Otomasyon:</strong> Sol menüdeki <strong>'🤖 Metni Süz'</strong> aracımızla ilanınızdaki bilgileri otomatik ayrıştırabilir, hazır 5 grafik rozeti tuvale ekleyebilirsiniz.<br>` +
               `• <strong>Doğru Format:</strong> Instagram için 1:1 Kare veya 4:5 Dikey formatları en yüksek erişimi sağlar.<br><br>` +
               `💡 Başka bir detay öğrenmek isterseniz başlık, fiyat yerleşimi veya Instagram stratejileri hakkında dilediğinizi sorabilirsiniz!`;
    };

    // ==================== ASİSTAN ETKİLEŞİMİ ====================
    window.showAiQuickAnswer = async function(key) {
        const questions = {
            format: 'Instagram için en iyi format ve boyut nedir?',
            price_pos: 'Fiyat rozetini nereye koymalıyım?',
            title_tips: 'İlan başlığı nasıl daha çok tık alır?',
            land_tips: 'Arsa ve tarla afişinde nelere dikkat edilmeli?',
            villa_tips: 'Lüks villa sunumunda öne çıkarılacak özellikler nelerdir?',
            social_times: 'Sosyal medyada gayrimenkul paylaşımı için en iyi saatler hangileridir?'
        };
        const q = questions[key] || key;

        const chatBox = document.getElementById('aiChatMessages');
        if (!chatBox) return;

        const userMsg = document.createElement('div');
        userMsg.className = 'ai-msg user';
        userMsg.innerHTML = `<span>${q}</span>`;
        chatBox.appendChild(userMsg);

        const aiMsg = document.createElement('div');
        aiMsg.className = 'ai-msg bot';
        
        let answer = await window.callDirectGeminiChat(q);
        if (!answer) {
            answer = window.generateLocalAiAssistantResponse(q);
        }

        aiMsg.innerHTML = `
            <div class="bot-header"><i class="fa-solid fa-wand-magic-sparkles"></i> <strong>Akıllı Emlak Danışmanı:</strong></div>
            <div class="bot-content">${answer.replace(/\n/g, '<br>')}</div>
        `;
        chatBox.appendChild(aiMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    window.sendAiCustomQuestion = async function() {
        const input = document.getElementById('aiCustomQuestionInput');
        if (!input || !input.value.trim()) return;

        const question = input.value.trim();
        input.value = '';

        const chatBox = document.getElementById('aiChatMessages');
        if (!chatBox) return;

        const userMsg = document.createElement('div');
        userMsg.className = 'ai-msg user';
        userMsg.textContent = question;
        chatBox.appendChild(userMsg);

        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'ai-msg bot';
        loadingMsg.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles fa-spin"></i> Yapay zeka düşünüyor...`;
        chatBox.appendChild(loadingMsg);
        chatBox.scrollTop = chatBox.scrollHeight;

        let aiReply = await window.callDirectGeminiChat(question);
        if (!aiReply) {
            aiReply = window.generateLocalAiAssistantResponse(question);
        }

        loadingMsg.innerHTML = `
            <div class="bot-header"><i class="fa-solid fa-wand-magic-sparkles"></i> <strong>Akıllı Emlak Danışmanı:</strong></div>
            <div class="bot-content">${aiReply.replace(/\n/g, '<br>')}</div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    window.openGeminiApiKeyPrompt = async function() {
        const currentKey = window.getGeminiApiKey();
        const key = prompt('🔑 Google Gemini API Anahtarınızı Yapıştırın (aistudio.google.com adresinden ücretsiz alınabilir):', currentKey);
        if (key !== null) {
            const cleanKey = key.trim();
            if (cleanKey) {
                window.setGeminiApiKey(cleanKey);
                // Anında canlı test yap
                const testResult = await window.testGeminiApiKey(cleanKey);
                if (testResult.success) {
                    alert('🎉 Harika! Canlı Google Gemini 1.5 Flash bağlantısı başarıyla kuruldu.\n\nArtık hem "🤖 Metni Süz" hem de "Akıllı Danışman" doğrudan gerçek Gemini AI ile çalışacak!');
                } else {
                    alert('⚠️ API Anahtarı kaydedildi ancak test yanıtında uyarı alındı:\n' + testResult.message + '\n\nLütfen aistudio.google.com üzerinden anahtarın aktif olduğunu kontrol edin.');
                }
            } else {
                window.setGeminiApiKey('');
                alert('ℹ️ Gemini API Anahtarı temizlendi. Sistem yerel doğal dil motoruyla çalışmaya devam edecek.');
            }
        }
    };

    window.openAiAssistantModal = function(initialTab = 'chat') {
        let modal = document.getElementById('aiAssistantModal');
        if (!modal) {
            createAiAssistantModalDOM();
            modal = document.getElementById('aiAssistantModal');
        }
        if (modal) {
            modal.style.display = 'flex';
            window.switchAiAssistantTab(initialTab);
        }
    };

    window.closeAiAssistantModal = function() {
        const modal = document.getElementById('aiAssistantModal');
        if (modal) modal.style.display = 'none';
    };

    window.switchAiAssistantTab = function(tabName) {
        const tabGuide = document.getElementById('aiTabGuide');
        const tabChat = document.getElementById('aiTabChat');
        const btnGuide = document.getElementById('btnAiTabGuide');
        const btnChat = document.getElementById('btnAiTabChat');

        if (tabName === 'guide') {
            if (tabGuide) tabGuide.style.display = 'block';
            if (tabChat) tabChat.style.display = 'none';
            if (btnGuide) btnGuide.classList.add('active');
            if (btnChat) btnChat.classList.remove('active');
        } else {
            if (tabGuide) tabGuide.style.display = 'none';
            if (tabChat) tabChat.style.display = 'block';
            if (btnGuide) btnGuide.classList.remove('active');
            if (btnChat) btnChat.classList.add('active');
        }
    };

    function createAiAssistantModalDOM() {
        const modal = document.createElement('div');
        modal.id = 'aiAssistantModal';
        modal.className = 'ai-assistant-modal-overlay';
        modal.style.display = 'none';

        modal.innerHTML = `
            <div class="ai-assistant-dialog" onclick="event.stopPropagation()">
                <div class="ai-dialog-header">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="ai-sparkle-icon">🤖</span>
                        <div>
                            <h3 style="margin:0; font-size:15px; font-weight:800; color:#0f172a;">Akıllı Emlak Danışmanı & Rehber</h3>
                            <p style="margin:2px 0 0 0; font-size:11px; color:#64748b;">Yapay zeka destekli emlak pazarlama & tasarım asistanı</p>
                        </div>
                    </div>
                    <button type="button" class="ai-dialog-close-btn" onclick="window.closeAiAssistantModal()">✕</button>
                </div>

                <div class="ai-dialog-tabs">
                    <button type="button" id="btnAiTabChat" class="ai-modal-tab-btn active" onclick="window.switchAiAssistantTab('chat')">
                        <i class="fa-solid fa-comments"></i> 💬 Akıllı Danışman (AI Soru-Cevap)
                    </button>
                    <button type="button" id="btnAiTabGuide" class="ai-modal-tab-btn" onclick="window.switchAiAssistantTab('guide')">
                        <i class="fa-solid fa-compass"></i> 🚀 5 Adımda Hızlı Kullanım Rehberi
                    </button>
                </div>

                <!-- 1. SEKME: SORU-CEVAP VE DANIŞMAN (AI FIRST) -->
                <div id="aiTabChat" class="ai-tab-content">
                    <div class="ai-quick-chips-title">💡 Popüler Emlak & Tasarım İpuçları (Tıklayın):</div>
                    <div class="ai-quick-chips">
                        <button type="button" class="ai-chip-btn" onclick="window.showAiQuickAnswer('format')">📱 Instagram formatı nedir?</button>
                        <button type="button" class="ai-chip-btn" onclick="window.showAiQuickAnswer('price_pos')">💰 Fiyat rozeti nereye konur?</button>
                        <button type="button" class="ai-chip-btn" onclick="window.showAiQuickAnswer('title_tips')">✍️ Tıklanan başlık nasıl yazılır?</button>
                        <button type="button" class="ai-chip-btn" onclick="window.showAiQuickAnswer('land_tips')">🌾 Arsa afişi püf noktaları</button>
                        <button type="button" class="ai-chip-btn" onclick="window.showAiQuickAnswer('villa_tips')">🏡 Lüks villa sunumu</button>
                        <button type="button" class="ai-chip-btn" onclick="window.showAiQuickAnswer('social_times')">⏰ En iyi paylaşım saati</button>
                    </div>

                    <div id="aiChatMessages" class="ai-chat-messages">
                        <div class="ai-msg bot">
                            <div class="bot-header"><i class="fa-solid fa-wand-magic-sparkles"></i> <strong>Akıllı Emlak Danışmanı:</strong></div>
                            <div class="bot-content">Merhaba! Emlak Stüdyom kullanımı, şablon seçimleri, rozet yerleşimleri veya sosyal medya emlak pazarlaması ile ilgili aklınıza takılan her şeyi sorabilirsiniz.</div>
                        </div>
                    </div>

                    <div class="ai-chat-input-bar">
                        <input type="text" id="aiCustomQuestionInput" placeholder="Emlak veya tasarım hakkında soru sorun..." onkeydown="if(event.key==='Enter') window.sendAiCustomQuestion();">
                        <button type="button" class="ai-send-btn" onclick="window.sendAiCustomQuestion()"><i class="fa-solid fa-paper-plane"></i></button>
                    </div>
                </div>

                <!-- 2. SEKME: ADIM ADIM REHBER -->
                <div id="aiTabGuide" class="ai-tab-content" style="display:none;">
                    <div class="guide-steps-container">
                        <div class="guide-step-card">
                            <div class="step-badge">1</div>
                            <div class="step-info">
                                <h4>📸 Fotoğrafınızı Yükleyin</h4>
                                <p>Sol paneldeki <strong>"Fotoğraf Seç / Yükle"</strong> butonuyla portföy fotoğrafınızı yükleyin. Zoom ve konum ayarlarıyla görseli tuvale oturtun.</p>
                            </div>
                        </div>

                        <div class="guide-step-card">
                            <div class="step-badge">2</div>
                            <div class="step-info">
                                <h4>🤖 İlan Metnini Yapıştırıp Süzün</h4>
                                <p>Sahibinden veya portföy ilan metninizi <strong>"Metni Süz"</strong> kutusuna yapıştırıp butona basın. Yapay zeka fiyat, m², ada/parsel, imar durumu ve bölge avantajlarını anında çıkarır.</p>
                            </div>
                        </div>

                        <div class="guide-step-card">
                            <div class="step-badge">3</div>
                            <div class="step-info">
                                <h4>🎨 İlana Özel Şablon ve 5 Grafik Rozet</h4>
                                <p>İlan bilgileriyle otomatik doldurulmuş <strong>5 Grafik Rozet</strong> ve ilana en uygun 3 şablon önerisinden dilediğinizi tek tıkla tuvalinize uygulayın.</p>
                            </div>
                        </div>

                        <div class="guide-step-card">
                            <div class="step-badge">4</div>
                            <div class="step-info">
                                <h4>📝 Sahibinden & Instagram Açıklaması</h4>
                                <p>Yapay zekanın bölge analizli hazırladığı ilan ve sosyal medya açıklamalarını <strong>"Metni Kopyala"</strong> butonuyla tek tıkla alın.</p>
                            </div>
                        </div>

                        <div class="guide-step-card">
                            <div class="step-badge">5</div>
                            <div class="step-info">
                                <h4>📥 Yüksek Kalitede Çıktı Alın</h4>
                                <p><strong>"Çıktı"</strong> sekmesinden Instagram Post (1:1), Story (9:16) veya Web (16:9) formatında Ultra HD olarak cihazınıza indirin.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

})(window);
