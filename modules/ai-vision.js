/**
 * ============================================================================
 * 📸 AKILLI FOTOĞRAF & GÖRSEL ANALİZ MOTORU (AI VISION & AUTO-PALETTE)
 * modules/ai-vision.js
 * ============================================================================
 */

(function(window) {
    'use strict';

    window.lastVisionAnalysis = null;

    /**
     * Yüklenen görseli anında analiz eden hızlı optik renk ve kategori motoru
     */
    window.analyzeUploadedImageVision = function(img, dataUrl) {
        if (!img) return;

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const sampleSize = 64;
            canvas.width = sampleSize;
            canvas.height = sampleSize;

            ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
            const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize);
            const d = imgData.data;

            let totalR = 0, totalG = 0, totalB = 0;
            let count = d.length / 4;

            for (let i = 0; i < d.length; i += 4) {
                totalR += d[i];
                totalG += d[i + 1];
                totalB += d[i + 2];
            }

            const avgR = Math.round(totalR / count);
            const avgG = Math.round(totalG / count);
            const avgB = Math.round(totalB / count);
            const brightness = Math.round((avgR * 299 + avgG * 587 + avgB * 114) / 1000);

            // Baskın ton ve çevre analizi
            const greenScore = avgG / (avgR + avgB + 1);
            const warmScore = (avgR + avgG * 0.5) / (avgB + 1);

            let detectedEnv = 'konut';
            let recommendedSaber = 'altin';
            let recommendedTheme = 'Altın & Zümrüt';
            let envLabel = '🏢 Konut / İç Mekan';

            if (greenScore > 0.55 || (avgG > avgR && avgG > avgB && avgG > 70)) {
                detectedEnv = 'arsa_arazi';
                recommendedSaber = 'turuncu';
                recommendedTheme = 'Doğa & Kadastro';
                envLabel = '🌾 Arsa / Arazi / Doğa Çekimi';
            } else if (warmScore > 1.6 && avgR > 120) {
                detectedEnv = 'villa_gunbatimi';
                recommendedSaber = 'altin';
                recommendedTheme = 'Lüks Sıcak Gold';
                envLabel = '🏡 Villa / Gün Batımı / Müstakil';
            } else if (brightness < 85) {
                detectedEnv = 'gece_luks';
                recommendedSaber = 'mavi';
                recommendedTheme = 'Neon Safir & Gece';
                envLabel = '🌃 Prestij / Gece / Koyu Tema';
            } else if (brightness > 180) {
                detectedEnv = 'ferah_icmekan';
                recommendedSaber = 'kirmizi';
                recommendedTheme = 'Modern Ferah';
                envLabel = '✨ Aydınlık & Ferah Mekan';
            }

            window.lastVisionAnalysis = {
                env: detectedEnv,
                envLabel: envLabel,
                brightness: brightness,
                dominantRgb: 'rgb(' + avgR + ', ' + avgG + ', ' + avgB + ')',
                recommendedSaber: recommendedSaber,
                recommendedTheme: recommendedTheme,
                timestamp: Date.now()
            };

            console.log('📸 AI Vision Analizi Tamamlandı:', window.lastVisionAnalysis);

            // Saber / Neon presetini otomatik kontrasta ayarla
            if (window.saberState && window.saberState.colorPreset !== recommendedSaber) {
                window.saberState.colorPreset = recommendedSaber;
                if (typeof window.applySaberPresetToSelection === 'function') {
                    window.applySaberPresetToSelection(recommendedSaber);
                }
            }

        } catch (e) {
            console.warn('AI Vision analiz hatası:', e);
        }
    };

    // ==================== SAYFA AÇILIŞINDA ARKA PLANDA AI WARM-UP ====================
    window.warmUpAiWorker = function() {
        const workerUrl = 'https://small-lab-3110.emlakstudyomtr.workers.dev';
        try {
            fetch(workerUrl, { method: 'GET' })
                .then(r => r.json())
                .then(data => {
                    console.log('⚡ Gemini AI Motoru Isındı & Hazır:', data.active_model || 'Aktif');
                })
                .catch(() => {});
        } catch (e) {}
    };

    // Sayfa hazır olduğunda otomatik ısıt
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        window.warmUpAiWorker();
    } else {
        document.addEventListener('DOMContentLoaded', window.warmUpAiWorker);
    }

})(window);
