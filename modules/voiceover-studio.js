/**
 * ============================================================================
 * 🎙️ EMLAK REKLAM SESLENDİRME STÜDYOSU (AI VOICEOVER & MP3 ENGINE)
 * modules/voiceover-studio.js
 * 
 * Özellikler:
 * 1. 🌟 Nöral Ses Profilleri:
 *    - Charon Neural (HD Erkek - Karizmatik & Derin Dış Ses) [Admin]
 *    - Zephyr Neural (HD Kadın - Prestijli & Akıcı) [Admin]
 *    - Ahmet Nöral (Erkek - Radyo & Reklam Spikeri)
 *    - Emel Nöral (Kadın - Kurumsal & Doğal Tanıtım)
 *    - WaveNet Erkek (Tok Tanıtım Tonu) [Admin]
 *    - WaveNet Kadın (Spiker Tonu) [Admin]
 *    - Standart TTS (Hızlı & Kesintisiz - Sınırsız)
 * 2. 🔢 Rakamları Metne (Yazıya) Çevirme Motoru (TTS Takılmalarını Önler)
 * 3. 🔄 Formdan Yeniden Tara & Güncelle
 * 4. 🪄 AI ile Düzenle & Komut Motoru (Daha Kısa, Daha Vurucu, Lüks, Özel Komut)
 * 5. 📊 Kota Takibi ve Otomatik Fallback (Kota dolunca kesintisiz Standart motora geçiş)
 * 6. ⬇️ Doğrudan Ayrı .MP3 Dosyası Olarak İndirme
 * 7. 🛡️ Admin Yetki Koruması
 * ============================================================================
 */

(function(window) {
    'use strict';

    // Kota ve Yapılandırma Sabitleri
    const DEFAULT_MAX_QUOTA = 50; // Aylık / Dönemlik Admin Neural Kotası
    const STORAGE_KEY_QUOTA = 'emlak_neural_quota_used';
    const STORAGE_KEY_CUSTOM_TTS_KEY = 'emlak_tts_api_key';

    // Ses Durum Yönetimi
    const VoiceStudio = {
        audioElement: null,
        currentBlobUrl: null,
        currentAudioBlob: null,
        isPlaying: false,
        isSynthesizing: false,
        isRefining: false,

        /**
         * Sayıyı Türkçe kelimelere dönüştürür (18500000 -> on sekiz milyon beş yüz bin)
         */
        numberToTurkishWords: function(n) {
            if (isNaN(n) || n === null) return '';
            n = Math.floor(Math.abs(Number(n)));
            if (n === 0) return 'sıfır';

            const ones = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
            const tens = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
            const thousands = ['', 'bin', 'milyon', 'milyar', 'trilyon'];

            function convertTriple(num) {
                let res = '';
                const h = Math.floor(num / 100);
                const t = Math.floor((num % 100) / 10);
                const o = num % 10;
                if (h > 0) res += (h === 1 ? '' : ones[h] + ' ') + 'yüz ';
                if (t > 0) res += tens[t] + ' ';
                if (o > 0) res += ones[o] + ' ';
                return res.trim();
            }

            let result = '';
            let groupIdx = 0;
            while (n > 0) {
                const triple = n % 1000;
                if (triple > 0) {
                    let tripleStr = convertTriple(triple);
                    if (groupIdx === 1 && triple === 1) tripleStr = '';
                    const groupUnit = thousands[groupIdx] ? thousands[groupIdx] + ' ' : '';
                    result = (tripleStr ? tripleStr + ' ' : '') + groupUnit + result;
                }
                n = Math.floor(n / 1000);
                groupIdx++;
            }
            return result.trim();
        },

        /**
         * Metindeki tüm sayıları, fiyatları, m² ve oda sayılarını Türkçe kelimelere dönüştürür
         * Slaş (taksim) işaretlerini 'bölü' dememesi için virgüle çevirir ve kısaltmaları açar.
         */
        convertNumbersToWords: function(text) {
            if (!text || typeof text !== 'string') return '';
            const self = this;

            // 1. Slaşları, taksimleri ve dik çizgileri doğal virgüle çevir (TTS 'bölü' demesin)
            text = text.replace(/\s*[\/\\]\s*/g, ', ');
            text = text.replace(/\s*\|\s*/g, ', ');

            // 2. Emlak ve Adres Kısaltmalarını Doğal Konuşma Dilinde Aç
            text = text.replace(/\b(Mah|mah|Mh|mh)\b\.?/gi, 'Mahallesi');
            text = text.replace(/\b(Cad|cad|Cd|cd)\b\.?/gi, 'Caddesi');
            text = text.replace(/\b(Sok|sok|Sk|sk)\b\.?/gi, 'Sokağı');
            text = text.replace(/\b(Bul|bul|Blv|blv)\b\.?/gi, 'Bulvarı');
            text = text.replace(/\b(Apt|apt)\b\.?/gi, 'Apartmanı');
            text = text.replace(/\b(Sit|sit)\b\.?/gi, 'Sitesi');
            text = text.replace(/\b(vb|v\.b)\b\.?/gi, 've benzeri');
            text = text.replace(/\b(vs|v\.s)\b\.?/gi, 've saire');
            text = text.replace(/\b(No|no|Nu|nu)\b\.?\s*(\d+)/gi, function(m, p1, p2) {
                return 'numara ' + self.numberToTurkishWords(parseInt(p2));
            });

            // 3. Oda formatı: 3+1, 4+2, 1+1, 2+1, 5+1
            text = text.replace(/(\d+)\s*\+\s*(\d+)/g, function(match, r1, r2) {
                const ones = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
                const w1 = ones[parseInt(r1)] || self.numberToTurkishWords(parseInt(r1));
                const w2 = ones[parseInt(r2)] || self.numberToTurkishWords(parseInt(r2));
                return w1 + ' artı ' + w2;
            });

            // 4. Metrekare: '145 m²', '1.250 m2', '500m²'
            text = text.replace(/([\d\.\,]+)\s*(m²|m2|metrekare)/gi, function(match, numStr) {
                const cleanNum = parseInt(numStr.replace(/\./g, '').replace(/,/g, ''));
                if (!isNaN(cleanNum)) {
                    return self.numberToTurkishWords(cleanNum) + ' metrekare';
                }
                return match;
            });

            // 5. Fiyat: '18.500.000 TL', '9.250.000 ₺'
            text = text.replace(/([\d\.\,]+)\s*(TL|tl|₺|lira|Türk Lirası)/gi, function(match, numStr) {
                const cleanNum = parseInt(numStr.replace(/\./g, '').replace(/,/g, ''));
                if (!isNaN(cleanNum)) {
                    return self.numberToTurkishWords(cleanNum) + ' Türk lirası';
                }
                return match;
            });

            // 6. Ada / Parsel: 'Ada: 101', 'Parsel: 91'
            text = text.replace(/(Ada|ada)\s*[:\s]\s*(\d+)/gi, function(match, label, num) {
                return self.numberToTurkishWords(parseInt(num)) + ' ada';
            });
            text = text.replace(/(Parsel|parsel)\s*[:\s]\s*(\d+)/gi, function(match, label, num) {
                return self.numberToTurkishWords(parseInt(num)) + ' parsel';
            });

            // 7. Bağımsız diğer sayılar (örn: '5 katlı', '2026')
            text = text.replace(/\b(\d+)\b/g, function(match, num) {
                const n = parseInt(num);
                return isNaN(n) ? match : self.numberToTurkishWords(n);
            });

            // 8. Gereksiz ünlemleri doğal sakin tonlama için noktaya çevir
            text = text.replace(/!+/g, '.');

            // 9. Noktalama ve boşluk düzeni
            text = text.replace(/,\s*,+/g, ', ');
            text = text.replace(/\.\s*\.+/g, '. ');
            text = text.replace(/,\s*\./g, '. ');
            text = text.replace(/\s+/g, ' ').trim();

            return text;
        },

        /**
         * Kullanıcının Yönetici (Admin) olup olmadığını doğrular
         */
        isAdmin: function() {
            try {
                if (window.IS_ADMIN === true) return true;
                if (localStorage.getItem('emlak_admin_access') === 'true') return true;
                if (window.currentUser && window.currentUser.role === 'admin') return true;
                if (window.supabaseUser && window.supabaseUser.role === 'admin') return true;
            } catch (e) {
                console.warn('[VoiceStudio] Admin kontrol hatası:', e);
            }
            return false;
        },

        /**
         * Kalan Neural kota miktarını getirir
         */
        getQuotaStatus: function() {
            const used = parseInt(localStorage.getItem(STORAGE_KEY_QUOTA) || '0', 10);
            const remaining = Math.max(0, DEFAULT_MAX_QUOTA - used);
            return {
                used: used,
                total: DEFAULT_MAX_QUOTA,
                remaining: remaining,
                isFull: remaining <= 0
            };
        },

        /**
         * Neural seslendirme yapıldığında kotayı 1 artırır
         */
        consumeQuota: function() {
            const current = parseInt(localStorage.getItem(STORAGE_KEY_QUOTA) || '0', 10);
            localStorage.setItem(STORAGE_KEY_QUOTA, (current + 1).toString());
            this.updateQuotaUI();
        },

        /**
         * Arayüzdeki kota rozetini ve sayacını günceller
         */
        updateQuotaUI: function() {
            const quotaBadge = document.getElementById('voiceQuotaDisplay');
            const quota = this.getQuotaStatus();
            if (quotaBadge) {
                if (this.isAdmin()) {
                    const isLow = quota.remaining <= 5;
                    const isLight = document.body && document.body.getAttribute('data-theme') === 'light';
                    const numColor = isLow ? '#dc2626' : (isLight ? '#047857' : '#34d399');
                    quotaBadge.innerHTML = `🛡️ Admin (Nöral) • Kalan Kota: <strong class="voice-quota-val" style="color:${numColor}; font-weight:800;">${quota.remaining}/${quota.total}</strong>`;
                } else {
                    quotaBadge.innerHTML = `<span class="voice-quota-free">⚡ Hızlı & Ücretsiz Seslendirme</span>`;
                }
            }
        },

        /**
         * Google Cloud TTS API için geçerli anahtarı tespit eder
         */
        getGoogleApiKey: function() {
            const customKey = localStorage.getItem(STORAGE_KEY_CUSTOM_TTS_KEY);
            if (customKey && customKey.trim()) return customKey.trim();

            if (typeof window.GOOGLE_MAPS_3D_KEY === 'string' && window.GOOGLE_MAPS_3D_KEY.trim()) {
                return window.GOOGLE_MAPS_3D_KEY.trim();
            }

            if (typeof window.getGeminiApiKey === 'function') {
                const gKey = window.getGeminiApiKey();
                if (gKey && gKey.trim()) return gKey.trim();
            }

            return 'AIzaSyB29TnBvpT2vmEiY9US_Op0S5mdJejOb_g';
        },

        /**
         * Google Cloud Text-to-Speech API üzerinden Neural ses üretir
         */
        synthesizeGoogleNeural: async function(text, voiceType, speed) {
            const apiKey = this.getGoogleApiKey();
            if (!apiKey) {
                throw new Error('Google Cloud API anahtarı bulunamadı.');
            }

            // Google Cloud Güncel Türkçe Nöral ve Stüdyo Sesleri (Chirp3-HD & Wavenet & Standard)
            let googleVoiceName = 'tr-TR-Standard-B';
            if (voiceType === 'charon_neural') {
                googleVoiceName = 'tr-TR-Chirp3-HD-Charon';
            } else if (voiceType === 'zephyr_neural') {
                googleVoiceName = 'tr-TR-Chirp3-HD-Zephyr';
            } else if (voiceType === 'ahmet_neural') {
                googleVoiceName = this.isAdmin() ? 'tr-TR-Chirp3-HD-Achird' : 'tr-TR-Standard-B';
            } else if (voiceType === 'emel_neural') {
                googleVoiceName = this.isAdmin() ? 'tr-TR-Chirp3-HD-Aoede' : 'tr-TR-Standard-C';
            } else if (voiceType === 'wavenet_male') {
                googleVoiceName = 'tr-TR-Wavenet-B';
            } else if (voiceType === 'wavenet_female') {
                googleVoiceName = 'tr-TR-Wavenet-C';
            } else if (voiceType === 'free_tts') {
                googleVoiceName = 'tr-TR-Standard-A';
            }

            const speakingRate = parseFloat(speed) || 1.05;
            const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
            const payload = {
                input: { text: text },
                voice: {
                    languageCode: 'tr-TR',
                    name: googleVoiceName
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: speakingRate,
                    pitch: 0.0
                }
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    signal: controller.signal,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    const errMsg = errData.error?.message || `HTTP ${response.status}`;
                    throw new Error(`Google Neural TTS Hatası: ${errMsg}`);
                }

                const data = await response.json();
                if (!data.audioContent) {
                    throw new Error('Google TTS geçerli ses verisi döndürmedi.');
                }

                const binaryString = atob(data.audioContent);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                const blob = new Blob([bytes], { type: 'audio/mp3' });
                return {
                    blob: blob,
                    url: URL.createObjectURL(blob),
                    engine: 'Google Neural (' + googleVoiceName.replace('tr-TR-', '') + ')'
                };
            } catch (fetchErr) {
                clearTimeout(timeoutId);
                throw fetchErr;
            }
        },

        /**
         * Ücretsiz TTS Motoru (Puter kaldırıldı, doğrudan yerel motor + MP3 indirme akışı)
         */
        synthesizeFreeTTS: async function(text, speed) {
            const cleanSnippet = encodeURIComponent(text.slice(0, 250));
            const streamUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=tr&q=${cleanSnippet}`;

            // 1. Tarayıcı Yerel Web Speech API (En hızlı, 0 gecikme, internet bağımsız)
            if ('speechSynthesis' in window) {
                return {
                    isSpeechSynthesis: true,
                    text: text,
                    rate: parseFloat(speed) || 1.05,
                    streamUrl: streamUrl,
                    engine: 'Standart Türkçe Ses Motoru'
                };
            }

            // 2. Bulut Audio Akışı
            const audio = new Audio(streamUrl);
            return {
                streamUrl: streamUrl,
                url: streamUrl,
                audioElement: audio,
                engine: 'Standart Bulut TTS'
            };
        },

        /**
         * Ana Seslendirme İşlevi (Rakamları Yazıya Çevir -> Neural -> Kota Kontrolü -> Fallback)
         */
        generateVoiceover: async function() {
            if (this.isSynthesizing) return;

            const area = document.getElementById('smartGeneratedDescArea');
            let text = area ? area.value.trim() : (window.smartVoiceoverScript || '');
            if (!text) {
                alert('Lütfen seslendirilecek reklam metnini yazın veya yapıştırın.');
                return;
            }

            // 1. RAKAMLARI TÜRKÇE KELİMELERLE DEĞİŞTİR
            text = this.convertNumbersToWords(text);
            if (area) area.value = text;
            window.smartVoiceoverScript = text;

            // 2. Temizlik: Emojileri ve gereksiz parantez içi etiketleri konuşma için sadeleştir
            const cleanSpeechText = text
                .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
                .replace(/#[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]+/g, '')
                .replace(/\(.*?\)/g, '')
                .replace(/\s+/g, ' ')
                .trim();

            const voiceSelect = document.getElementById('voiceEngineSelect');
            const selectedVoice = voiceSelect ? voiceSelect.value : 'charon_neural';
            const speedSelect = document.getElementById('voiceSpeedSelect');
            const selectedSpeed = speedSelect ? speedSelect.value : '1.05';

            const playBtn = document.getElementById('btnVoiceoverPlay');
            const stopBtn = document.getElementById('btnVoiceoverStop');
            const downloadBtn = document.getElementById('btnVoiceoverDownload');
            const statusIndicator = document.getElementById('voiceStudioStatus');

            this.isSynthesizing = true;
            if (playBtn) {
                playBtn.disabled = true;
                playBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Ses Sentezleniyor...';
            }
            if (statusIndicator) {
                statusIndicator.style.display = 'block';
                statusIndicator.innerHTML = '<span style="color:#38bdf8;"><i class="fa-solid fa-wand-magic-sparkles fa-spin"></i> Yapay zeka emlak reklamı seslendiriliyor...</span>';
            }

            let result = null;
            let usedEngine = '';

            const quota = this.getQuotaStatus();
            const isUserAdmin = this.isAdmin();
            const isHdVoice = (selectedVoice === 'charon_neural' || selectedVoice === 'zephyr_neural');
            const isNeuralVoice = selectedVoice !== 'free_tts';

            try {
                // HD sesler Admin korumalıdır
                if (isHdVoice && !isUserAdmin) {
                    if (statusIndicator) {
                        statusIndicator.innerHTML = '<span style="color:#f59e0b;">ℹ️ HD Nöral sesler Admin onaylıdır. Standart motor ile seslendiriliyor...</span>';
                    }
                    result = await this.synthesizeFreeTTS(cleanSpeechText, selectedSpeed);
                    usedEngine = 'Standart TTS Motoru';
                } else if (isNeuralVoice) {
                    if (isHdVoice && quota.isFull) {
                        if (statusIndicator) {
                            statusIndicator.innerHTML = '<span style="color:#f59e0b;">⚠️ Nöral kota limiti aşıldı! Kesinti olmaması için Standart TTS motoruna aktarıldı.</span>';
                        }
                        result = await this.synthesizeFreeTTS(cleanSpeechText, selectedSpeed);
                        usedEngine = 'Standart TTS (Kota Aşımı Fallback)';
                    } else {
                        try {
                            result = await this.synthesizeGoogleNeural(cleanSpeechText, selectedVoice, selectedSpeed);
                            if (isHdVoice) this.consumeQuota();
                            usedEngine = result.engine;
                        } catch (neuralErr) {
                            console.warn('[VoiceStudio] Nöral API hatası, fallback yapılıyor:', neuralErr);
                            if (statusIndicator) {
                                statusIndicator.innerHTML = `<span style="color:#f59e0b;">⚠️ Nöral API uyarısı (${neuralErr.message || 'bağlantı'}). Standart TTS motoruna aktarılıyor...</span>`;
                            }
                            result = await this.synthesizeFreeTTS(cleanSpeechText, selectedSpeed);
                            usedEngine = 'Standart TTS (API Fallback)';
                        }
                    }
                } else {
                    // Standart TTS
                    result = await this.synthesizeFreeTTS(cleanSpeechText, selectedSpeed);
                    usedEngine = 'Standart TTS';
                }

                await this.handleAudioReady(result, usedEngine, cleanSpeechText, selectedSpeed);

            } catch (err) {
                console.error('[VoiceStudio] Seslendirme genel hatası:', err);
                alert('Seslendirme oluşturulurken bir hata oluştu:\n' + err.message);
                if (statusIndicator) {
                    statusIndicator.innerHTML = `<span style="color:#ef4444;">❌ Hata: ${err.message}</span>`;
                }
            } finally {
                this.isSynthesizing = false;
                if (playBtn) {
                    playBtn.disabled = false;
                    playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Seslendir ve Dinle';
                }
            }
        },

        /**
         * Başarıyla üretilen sesi DOM oynatıcısına ve indirme butonuna bağlar
         */
        handleAudioReady: async function(result, engineLabel, text, speed) {
            const player = document.getElementById('voiceoverAudioPlayer');
            const stopBtn = document.getElementById('btnVoiceoverStop');
            const downloadBtn = document.getElementById('btnVoiceoverDownload');
            const statusIndicator = document.getElementById('voiceStudioStatus');

            this.stopPlayback();

            if (result.blob) {
                this.currentAudioBlob = result.blob;
                this.currentBlobUrl = URL.createObjectURL(result.blob);

                if (player) {
                    player.src = this.currentBlobUrl;
                    player.style.display = 'block';
                    player.play().catch(e => console.warn('Otomatik oynatma engellendi:', e));
                }

                if (downloadBtn) {
                    downloadBtn.disabled = false;
                    downloadBtn.classList.remove('disabled');
                    downloadBtn.style.opacity = '1';
                    downloadBtn.style.cursor = 'pointer';
                    downloadBtn.setAttribute('title', 'Seslendirmeyi MP3 Olarak İndir');
                }

                if (statusIndicator) {
                    statusIndicator.innerHTML = `
                        <span style="color:#10b981;">
                            <i class="fa-solid fa-circle-check"></i> Seslendirme hazır (${engineLabel}). MP3 olarak indirebilirsiniz.
                        </span>
                    `;
                }
            } else if (result.streamUrl) {
                if (player) {
                    player.src = result.streamUrl;
                    player.style.display = 'block';
                    player.play().catch(e => console.warn('Stream oynatma engellendi:', e));
                }

                fetch(result.streamUrl)
                    .then(r => r.blob())
                    .then(blob => {
                        this.currentAudioBlob = blob;
                        if (downloadBtn) {
                            downloadBtn.disabled = false;
                            downloadBtn.style.opacity = '1';
                            downloadBtn.style.cursor = 'pointer';
                        }
                    })
                    .catch(() => {
                        this.currentAudioBlob = null;
                        this.currentBlobUrl = result.streamUrl;
                        if (downloadBtn) {
                            downloadBtn.disabled = false;
                            downloadBtn.style.opacity = '1';
                        }
                    });

                if (statusIndicator) {
                    statusIndicator.innerHTML = `
                        <span style="color:#10b981;">
                            <i class="fa-solid fa-circle-check"></i> Seslendirme hazır (${engineLabel}).
                        </span>
                    `;
                }
            } else if (result.isSpeechSynthesis) {
                const self = this;
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'tr-TR';
                utterance.rate = parseFloat(speed) || 1.05;
                
                const voices = window.speechSynthesis.getVoices();
                const trVoice = voices.find(v => v.lang && v.lang.toLowerCase().includes('tr'));
                if (trVoice) utterance.voice = trVoice;

                utterance.onend = () => {
                    self.stopPlayback();
                };
                utterance.onerror = (e) => {
                    console.warn('[VoiceStudio] Konuşma hatası:', e);
                    self.stopPlayback();
                };

                window.speechSynthesis.speak(utterance);

                if (player) {
                    player.style.display = 'none';
                }

                this.currentAudioBlob = null;
                this.currentBlobUrl = result.streamUrl;

                if (downloadBtn) {
                    downloadBtn.disabled = false;
                    downloadBtn.classList.remove('disabled');
                    downloadBtn.style.opacity = '1';
                    downloadBtn.style.cursor = 'pointer';
                    downloadBtn.setAttribute('title', 'Seslendirmeyi MP3 Olarak İndir');
                }

                if (statusIndicator) {
                    statusIndicator.innerHTML = `
                        <span style="color:#10b981;">
                            <i class="fa-solid fa-circle-check"></i> Seslendirme hazır (${engineLabel}). MP3 olarak indirebilirsiniz.
                        </span>
                    `;
                }
            }

            if (stopBtn) stopBtn.style.display = 'inline-flex';
            this.isPlaying = true;
        },

        /**
         * Ses oynatmayı anında durdurur
         */
        stopPlayback: function() {
            const player = document.getElementById('voiceoverAudioPlayer');
            if (player) {
                player.pause();
                player.currentTime = 0;
            }
            if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
            const stopBtn = document.getElementById('btnVoiceoverStop');
            if (stopBtn) stopBtn.style.display = 'none';
            this.isPlaying = false;
        },

        /**
         * Üretilen sesi bilgisayara/telefona .MP3 formatında indirir
         */
        downloadMP3: function() {
            if (this.currentAudioBlob) {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(this.currentAudioBlob);
                a.download = `emlak-reklam-seslendirme-${Date.now()}.mp3`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                }, 100);
            } else if (this.currentBlobUrl) {
                const a = document.createElement('a');
                a.href = this.currentBlobUrl;
                a.target = '_blank';
                a.download = `emlak-reklam-seslendirme-${Date.now()}.mp3`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                }, 100);
            } else {
                alert('Önce "Seslendir ve Dinle" butonuna basarak seslendirmeyi üretmelisiniz.');
            }
        },

        /**
         * Formdaki güncel verileri yeniden tarar ve seslendirme metnini günceller
         */
        rescanFormAndRegenerate: function() {
            const freshData = {
                title: document.getElementById('titleInput')?.value || '',
                price: document.getElementById('priceInput')?.value || '',
                size: document.getElementById('sizeInput')?.value || document.getElementById('araziSizeInput')?.value || '',
                rooms: document.getElementById('roomsInput')?.value || '',
                imar: document.getElementById('imarInput')?.value || '',
                tapu: document.getElementById('tapuInput')?.value || '',
                location: document.getElementById('locationInput')?.value || document.getElementById('locSelect')?.value || '',
                ada: document.getElementById('adaInput')?.value || '',
                parsel: document.getElementById('parselInput')?.value || '',
                desc: document.getElementById('descInput')?.value || ''
            };

            if (typeof window.generateSmartVoiceoverScript === 'function') {
                const newText = window.generateSmartVoiceoverScript(freshData, true);
                const area = document.getElementById('smartGeneratedDescArea');
                if (area) {
                    area.value = newText;
                    window.smartVoiceoverScript = newText;
                }

                let ind = document.getElementById('autosave-indicator');
                if (ind) {
                    ind.innerHTML = '🔄 Form verileri yeniden tarandı ve seslendirme metni güncellendi!';
                    ind.style.opacity = '1';
                    setTimeout(() => { ind.style.opacity = '0'; }, 2500);
                }
            }
        },

        /**
         * AI ile Seslendirme Metnini Yeniden Düzenler / Komut İşler
         */
        refineVoiceoverWithAI: async function(instruction) {
            if (this.isRefining) return;

            const area = document.getElementById('smartGeneratedDescArea');
            let currentText = area ? area.value.trim() : (window.smartVoiceoverScript || '');
            if (!currentText) {
                alert('Düzenlenecek bir seslendirme metni bulunamadı. Lütfen önce "Metni Süz" veya "Yeniden Tara" butonunu kullanın.');
                return;
            }

            const promptInput = document.getElementById('voiceCustomPromptInput');
            let finalInstruction = instruction;
            if (!finalInstruction && promptInput) {
                finalInstruction = promptInput.value.trim();
            }
            if (!finalInstruction) {
                finalInstruction = 'Daha akıcı, etkileyici ve samimi bir dille yeniden yaz';
            }

            const statusIndicator = document.getElementById('voiceStudioStatus');
            const self = this;
            this.isRefining = true;

            if (statusIndicator) {
                statusIndicator.style.display = 'block';
                statusIndicator.innerHTML = `<span style="color:#a855f7;"><i class="fa-solid fa-wand-magic-sparkles fa-spin"></i> AI Komutu İşleniyor: "${finalInstruction}"...</span>`;
            }

            try {
                const apiKey = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
                
                if (apiKey) {
                    const aiPrompt = `Sen profesyonel bir emlak reklam yazarı ve spikerisin.
Aşağıdaki Türkçe emlak reklam seslendirme metnini şu yönergeye göre YENİDEN YAZ: "${finalInstruction}".

ÖNEMLİ KURALLAR:
1. Reklam filmi veya Instagram Reels/TikTok dış sesi için uygun, yaklaşık 40-55 saniye (70-110 kelime) uzunluğunda, sürükleyici ve profesyonel bir ton kullan.
2. KESİNLİKLE RAKAM (0-9) KULLANMA! Metindeki tüm sayıları, oda sayılarını, fiyatları ve metrekareleri tamamen Türkçe YAZIYLA yaz! (Örn: 3+1 yerine "üç artı bir", 18.500.000 TL yerine "on sekiz milyon beş yüz bin Türk lirası", 145 m² yerine "yüz kırk beş metrekare").
3. SADECE ve SADECE seslendirilecek metni döndür. Tırnak işareti, başlık veya açıklayıcı not ekleme.

Mevcut Metin:
${currentText}`;

                    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: aiPrompt }] }],
                            generationConfig: { temperature: 0.4, maxOutputTokens: 600 }
                        })
                    });

                    const data = await res.json();
                    let refinedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    if (refinedText) {
                        refinedText = refinedText.replace(/^["']|["']$/g, '').trim();
                        refinedText = self.convertNumbersToWords(refinedText);
                        if (area) area.value = refinedText;
                        window.smartVoiceoverScript = refinedText;

                        if (statusIndicator) {
                            statusIndicator.innerHTML = '<span style="color:#10b981;"><i class="fa-solid fa-circle-check"></i> Seslendirme metni başarıyla güncellendi!</span>';
                            setTimeout(() => { if (!self.isPlaying) statusIndicator.style.display = 'none'; }, 3000);
                        }
                        if (promptInput) promptInput.value = '';
                        return;
                    }
                }

                // API Key yoksa veya başarısız olursa akıllı yerel kural motoruyla uyarla
                let localRefined = currentText;
                if (finalInstruction.includes('kısa') || finalInstruction.includes('özet')) {
                    const sentences = currentText.split(/[.!?]+/).filter(s => s.trim().length > 5);
                    if (sentences.length > 2) {
                        localRefined = sentences[0].trim() + '. ' + sentences[sentences.length - 1].trim() + '.';
                    }
                } else if (finalInstruction.includes('lüks') || finalInstruction.includes('prestij')) {
                    localRefined = localRefined.replace(/fırsat/gi, 'seçkin ayrıcalık').replace(/güzel/gi, 'kusursuz ve prestijli');
                } else if (finalInstruction.includes('yatırım')) {
                    localRefined += ' Bölgenin en yüksek prim vadeden bu gayrimenkulü, yatırımcısına bugünden kazandırmaya hazır!';
                }
                localRefined = self.convertNumbersToWords(localRefined);
                if (area) area.value = localRefined;
                window.smartVoiceoverScript = localRefined;

                if (statusIndicator) {
                    statusIndicator.innerHTML = '<span style="color:#10b981;"><i class="fa-solid fa-circle-check"></i> Metin kural motoruyla güncellendi!</span>';
                    setTimeout(() => { if (!self.isPlaying) statusIndicator.style.display = 'none'; }, 3000);
                }

            } catch (err) {
                console.error('[VoiceStudio] AI komut hatası:', err);
                if (statusIndicator) {
                    statusIndicator.innerHTML = `<span style="color:#ef4444;">❌ Düzenleme hatası: ${err.message}</span>`;
                }
            } finally {
                this.isRefining = false;
            }
        },

        /**
         * Admin için özel Google TTS API anahtarı yapılandırma penceresi
         */
        openAdminKeyModal: function() {
            if (!this.isAdmin()) {
                alert('Bu ayar sadece Admin yetkisine sahip kullanıcılar içindir.');
                return;
            }

            const current = localStorage.getItem(STORAGE_KEY_CUSTOM_TTS_KEY) || '';
            const newKey = prompt(
                '🔑 Özel Google Cloud Text-to-Speech API Anahtarı:\n\n' +
                '(Boş bırakırsanız varsayılan sistem anahtarı kullanılır)\n\n' +
                'Mevcut Anahtar: ' + (current ? current.slice(0, 8) + '...' : 'Varsayılan Sistem Anahtarı'),
                current
            );

            if (newKey !== null) {
                if (newKey.trim()) {
                    localStorage.setItem(STORAGE_KEY_CUSTOM_TTS_KEY, newKey.trim());
                    alert('✅ Özel Google TTS API anahtarı kaydedildi!');
                } else {
                    localStorage.removeItem(STORAGE_KEY_CUSTOM_TTS_KEY);
                    alert('ℹ️ Özel anahtar kaldırıldı, varsayılan sistem anahtarı kullanılacak.');
                }
                this.updateQuotaUI();
            }
        }
    };

    window.VoiceStudio = VoiceStudio;

})(window);
