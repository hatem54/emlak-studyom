/**
 * ============================================================
 * EMLAK STÜDYOM - CANLI ANİMASYONLU VİDEO KAYIT MOTORU
 * modules/export-video.js
 * ============================================================
 *
 * Bağımsız video kayıt motoru:
 * - HTML5 Canvas animasyonlu kare yakalama (CaptureStream / MediaRecorder)
 * - Yüzen durum ve ilerleme bildirim widgetı (Video Toast HUD)
 * - MP4 / WebM formatında yüksek kaliteli video render ve indirme
 */
// ══════════════════════════════════════════════
// 🎬 YÜZEN MİNİ VİDEO BİLDİRİMİ / ARKA PLAN WİDGETI
// ══════════════════════════════════════════════
let _videoToastTimeout = null;
let _videoToastBlobUrl = null; // Bellek sızıntısını önlemek için blob URL referansı


function createOrGetVideoToast() {
    let toast = document.getElementById('emlak-video-export-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'emlak-video-export-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999999;
            background: rgba(15, 23, 42, 0.96);
            border: 1px solid rgba(99, 102, 241, 0.4);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(99, 102, 241, 0.25);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-radius: 12px;
            padding: 14px 18px;
            display: flex;
            align-items: center;
            gap: 14px;
            min-width: 320px;
            max-width: 420px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #ffffff;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: auto;
        `;
        document.body.appendChild(toast);
    }
    return toast;
}

function updateVideoToastProgress(pct, remainingSec) {
    const toast = createOrGetVideoToast();
    toast.style.borderColor = 'rgba(99, 102, 241, 0.4)';
    toast.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(99, 102, 241, 0.25)';
    toast.innerHTML = `
        <div style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #ec4899); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 12px rgba(245, 158, 11, 0.5);">
            <i class="fa-solid fa-video" style="color: #fff; font-size: 16px;"></i>
        </div>
        <div style="flex: 1; min-width: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 13px; font-weight: 700; color: #f1f5f9;">Canlı Video Kaydediliyor</span>
                <span style="font-size: 12px; font-weight: 800; color: #f59e0b;">%${pct}</span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                Arka planda işleniyor, çalışmaya devam edebilirsiniz
            </div>
            <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.12); border-radius: 99px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #f59e0b, #ec4899, #6366f1); border-radius: 99px; transition: width 0.08s linear;"></div>
            </div>
        </div>
        <button type="button" onclick="closeVideoToast()" style="background: none; border: none; color: #64748b; font-size: 18px; cursor: pointer; padding: 0 4px; line-height: 1;" title="Kapat">&times;</button>
    `;
    toast.style.display = 'flex';
}

function finishVideoToastSuccess(filename, sizeMb, url) {
    _videoToastBlobUrl = url;
    const toast = createOrGetVideoToast();
    toast.style.borderColor = 'rgba(16, 185, 129, 0.6)';
    toast.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(16, 185, 129, 0.35)';
    toast.innerHTML = `
        <div style="width: 38px; height: 38px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 14px rgba(16, 185, 129, 0.5);">
            <i class="fa-solid fa-check" style="color: #fff; font-size: 18px;"></i>
        </div>
        <div style="flex: 1; min-width: 0;">
            <div style="font-size: 13px; font-weight: 700; color: #10b981; margin-bottom: 2px;">
                Video Hazır! (${sizeMb} MB)
            </div>
            <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${filename}">
                ${filename}
            </div>
            <a href="${url}" download="${filename}" id="toastDirectDownloadBtn" style="display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 6px; text-decoration: none; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4);">
                <i class="fa-solid fa-download"></i> Hemen İndir
            </a>
        </div>
        <button type="button" onclick="closeVideoToast()" style="background: none; border: none; color: #64748b; font-size: 18px; cursor: pointer; padding: 0 4px; line-height: 1;" title="Kapat">&times;</button>
    `;

    if (_videoToastTimeout) clearTimeout(_videoToastTimeout);
    _videoToastTimeout = setTimeout(closeVideoToast, 8000);
}

function finishVideoToastError(message) {
    const toast = createOrGetVideoToast();
    toast.style.borderColor = 'rgba(239, 68, 68, 0.6)';
    toast.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(239, 68, 68, 0.3)';
    toast.innerHTML = `
        <div style="width: 38px; height: 38px; border-radius: 50%; background: #ef4444; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i class="fa-solid fa-triangle-exclamation" style="color: #fff; font-size: 18px;"></i>
        </div>
        <div style="flex: 1; min-width: 0;">
            <div style="font-size: 13px; font-weight: 700; color: #ef4444; margin-bottom: 2px;">Video Kaydedilemedi</div>
            <div style="font-size: 11px; color: #cbd5e1;">${message}</div>
        </div>
        <button type="button" onclick="closeVideoToast()" style="background: none; border: none; color: #64748b; font-size: 18px; cursor: pointer; padding: 0 4px; line-height: 1;">&times;</button>
    `;
    if (_videoToastTimeout) clearTimeout(_videoToastTimeout);
    _videoToastTimeout = setTimeout(closeVideoToast, 6000);
}

function closeVideoToast() {
    const toast = document.getElementById('emlak-video-export-toast');
    if (toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        setTimeout(() => { 
            if (toast.parentNode) toast.parentNode.removeChild(toast); 
            if (_videoToastBlobUrl) {
                URL.revokeObjectURL(_videoToastBlobUrl);
                _videoToastBlobUrl = null;
            }
        }, 250);
    }
}
window.closeVideoToast = closeVideoToast;

function getBestSupportedVideoMime() {
    // Canvas kaydı için saf video codec'leri (mp4a ses codec'i ASLA eklenmez)
    const candidates = [
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
    ];
    const testCanvas = document.createElement('canvas');
    testCanvas.width = 16; testCanvas.height = 16;
    const testStream = testCanvas.captureStream ? testCanvas.captureStream(10) : null;
    if (testStream && typeof MediaRecorder !== 'undefined') {
        for (const type of candidates) {
            try {
                if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
                    const testRec = new MediaRecorder(testStream, { mimeType: type });
                    if (testRec && testRec.state === 'inactive') {
                        return type;
                    }
                }
            } catch(e) {}
        }
    }
    return 'video/webm';
}

// ══════════════════════════════════════════════
// 🎬 CANLI ANİMASYONLU VİDEO KAYIT MOTORU (ARKA PLANDA ÇALIŞIR)
// ══════════════════════════════════════════════
async function exportAnimatedVideo(options = {}) {
    // 1. Zaten arka planda kayıt varsa uyar
    if (window.isExportingVideo) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'info',
                title: 'Video Zaten Hazırlanıyor',
                text: 'Şu anda arka planda bir video kaydediliyor. Lütfen bitmesini bekleyin.',
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#6366f1'
            });
        }
        return;
    }

    // 2. Pro / Demo Yetki ve Kilit Kontrolü
    if (typeof window.validateExportAllowed === 'function') {
        const check = window.validateExportAllowed();
        if (!check.allowed) {
            hideExportLoading();
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'warning',
                    title: check.title || '🔒 Pro Özellik Kullanımı',
                    html: `<div style="font-size:14px; line-height:1.6; color:#cbd5e1; text-align:left; margin-top:8px;">${check.message}</div>`,
                    background: '#1e293b',
                    color: '#fff',
                    confirmButtonText: 'Tamam, Anladım',
                    confirmButtonColor: '#6366f1'
                });
            } else if (typeof showProUpgradeToast === 'function') {
                showProUpgradeToast(check.message);
            } else {
                alert('🔒 ' + check.message);
            }
            return;
        }
    }

    // 3. Tarayıcı Video Desteği Kontrolü
    if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Tarayıcı Desteği Gerekli',
                text: 'Tarayıcınız video kaydetme özelliğini (MediaRecorder) desteklemiyor. Lütfen güncel Chrome, Edge veya Safari kullanın.',
                background: '#1e293b',
                color: '#fff'
            });
        } else {
            alert('Tarayıcınız video kaydetmeyi desteklemiyor. Lütfen güncel bir tarayıcı kullanın.');
        }
        return;
    }

    const chosenMime = getBestSupportedVideoMime();
    const durationSeconds = (options && options.duration) ? options.duration : 3;
    const durationMs = durationSeconds * 1000;

    // 🚀 Video dışa aktarma bayrağını en baştan aktifleştir (Saber motorunu uyarır ve clonelama temizliğini tetikler)
    window.isExportingVideo = true;

    // 🚀 Tam ekran engelleyici loader'ı kesinlikle açma, açıksa derhal kapat
    hideAppLoading(0, true);

    // Sağ altta yüzen mini bildirim kartını başlat
    updateVideoToastProgress(5, durationSeconds.toFixed(1));

    await ensureFontsLoaded();
    await new Promise(r => setTimeout(r, 40));

    // Deselect UI
    if (typeof deselectAll === 'function') deselectAll();
    if (typeof _cerceveSecimKaldir === 'function') _cerceveSecimKaldir();
    if (typeof window._cerceveSecimKaldir === 'function') window._cerceveSecimKaldir();
    document.querySelectorAll('.el-selected').forEach(e => e.classList.remove('el-selected'));
    document.querySelectorAll('.text-handle').forEach(h => h.remove());
    document.querySelectorAll('.callout-controls, .callout-resizer, .callout-rotator, .callout-select-border, .callout-lock-btn, .cbtn-del, .callout-handle-width, .callout-handle-length, .draw-handle, .vertex-handle, .cerceve-handle, .kolaj-handle').forEach(c => c.style.display = 'none');
    const existingCtxMenu = document.getElementById('app-custom-context-menu');
    if (existingCtxMenu) existingCtxMenu.remove();

    // Prepare photos (varsa)
    document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => {
        if (!p.querySelector('.photo-render-canvas') && p.style.backgroundImage && p.style.backgroundImage !== 'none') {
            if (typeof _preparePhoto === 'function') _preparePhoto(p);
        }
        if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p);
    });

    // Calculate dimensions
    const formatName = exportFormat ? exportFormat.value : '16:9 Full HD';
    const format = (typeof EXPORT_FORMATS !== 'undefined' && EXPORT_FORMATS[formatName]) || { w: 1920, h: 1080 };
    const currentW = parseInt(canvasEl.style.width) || 1920;
    const currentH = parseInt(canvasEl.style.height) || 1080;

    let targetW = Math.round(format.w);
    let targetH = Math.round(format.h);

    // Video donanım hızlandırma ve yüksek kalite standardı için maksimum 4K UHD (3840x2160) sınırla
    const MAX_VID_W = 3840;
    const MAX_VID_H = 2160;
    if (targetW > MAX_VID_W || targetH > MAX_VID_H) {
        const fitRatio = Math.min(MAX_VID_W / targetW, MAX_VID_H / targetH);
        targetW = Math.round(targetW * fitRatio);
        targetH = Math.round(targetH * fitRatio);
    }
    // Video codec'leri (H.264 / VP8 / VP9) için kesinlikle çift sayı (even) olmalıdır
    if (targetW % 2 !== 0) targetW += 1;
    if (targetH % 2 !== 0) targetH += 1;

    const saberApp = (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') ? window.SaberEngine.getApp() : null;
    const saberView = saberApp ? saberApp.view : document.getElementById('saber-layer');
    if (saberView) saberView.style.visibility = 'hidden';

    // ══════════════════════════════════════════════════
    // STATİK TABAN CANVAS'INI HIZLI VE KESİNTİSİZ OLUŞTUR
    // ══════════════════════════════════════════════════
    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = targetW;
    baseCanvas.height = targetH;
    const baseCtx = baseCanvas.getContext('2d');
    baseCtx.imageSmoothingEnabled = true;
    baseCtx.imageSmoothingQuality = 'high';

    // 1. Arka plan rengi
    let customBg = window.getComputedStyle(canvasEl).backgroundColor;
    if (customBg && customBg !== 'rgba(0, 0, 0, 0)' && customBg !== 'transparent') {
        baseCtx.fillStyle = customBg;
        baseCtx.fillRect(0, 0, targetW, targetH);
    } else {
        baseCtx.fillStyle = '#1e293b';
        baseCtx.fillRect(0, 0, targetW, targetH);
    }

    // 2. Fotoğraf katmanını doğrudan fiziksel canvas'tan bas (Milisaniyeler sürer, asla asılı kalmaz)
    const renderCanvas = document.querySelector('.photo-render-canvas');
    if (renderCanvas && renderCanvas.width > 0) {
        try {
            baseCtx.drawImage(renderCanvas, 0, 0, targetW, targetH);
        } catch(e) {}
    } else {
        // Fallback fotoğraf URL'si varsa zaman aşımlı yükle (maksimum 1.5 sn)
        let safeMasterImage = (typeof uploadedImgUrl !== 'undefined' ? uploadedImgUrl : null) || (typeof masterImageBase64 !== 'undefined' ? masterImageBase64 : null);
        if (safeMasterImage) {
            await new Promise(resolve => {
                const img = new Image();
                if (!safeMasterImage.startsWith('data:') && !safeMasterImage.startsWith('blob:')) img.crossOrigin = 'anonymous';
                const timer = setTimeout(resolve, 1500);
                img.onload = () => { clearTimeout(timer); try { baseCtx.drawImage(img, 0, 0, targetW, targetH); } catch(e){} resolve(); };
                img.onerror = () => { clearTimeout(timer); resolve(); };
                img.src = safeMasterImage;
            });
        }
    }

    // 3. Çizim katmanını (draw-layer) doğrudan bas
    const drawCanvas = document.getElementById('draw-layer') || document.getElementById('drawCanvas');
    if (drawCanvas && drawCanvas.width > 0) {
        try {
            baseCtx.drawImage(drawCanvas, 0, 0, targetW, targetH);
        } catch(e) {}
    }

    // Çizimleri ve dolguları video temel tuvaline bas
    if (typeof window.redrawAllToContext === 'function') {
        const hasSaberActive = !!(window.SaberEngine && typeof window.SaberEngine.getApp === 'function');
        window.redrawAllToContext(baseCtx, outputScale, { skipNeonStrokes: hasSaberActive });
    }

    // 3D WebGL Katmanı (#three-d-layer)
    draw3DLayerToContext(baseCtx, targetW, targetH);

    // 4. Şablon, metinler ve rozetler (Sadece varsa html2canvas çalıştır)
    const hasTemplates = !!canvasEl.querySelector('#canva-render-layer > *');
    const hasBadges = Array.from(canvasEl.querySelectorAll('#ui-layer .canvas-el')).some(el => {
        return el.style.display !== 'none' && el.style.visibility !== 'hidden' && el.style.opacity !== '0';
    });
    const hasCallouts = Array.from(canvasEl.querySelectorAll('.callout-wrap, .co-neon-block, .svg-callout')).some(el => {
        return el.style.display !== 'none' && el.style.visibility !== 'hidden';
    });
    const hasLogo = (() => {
        const l = canvasEl.querySelector('#elLogo');
        return !!(l && l.style.display !== 'none' && l.style.visibility !== 'hidden');
    })();
    const needsHtml2Canvas = hasTemplates || hasBadges || hasCallouts || hasLogo;

    if (needsHtml2Canvas) {
        try {
            const savedBg = canvasEl.style.backgroundColor;
            canvasEl.style.setProperty('background-color', 'transparent', 'important');

            const h2cPromise = html2canvas(canvasEl, {
                width: currentW,
                height: currentH,
                scale: 1,
                useCORS: true,
                allowTaint: false,
                imageTimeout: 1500,
                logging: false,
                backgroundColor: null,
                ignoreElements: (el) => isExportIgnoredElement(el),
                onclone: (clonedDoc) => sanitizeExportClone(clonedDoc)
            });
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('html2canvas-timeout')), 2000));
            const capturedCanvas = await Promise.race([h2cPromise, timeoutPromise]);

            if (savedBg) {
                canvasEl.style.setProperty('background-color', savedBg, 'important');
            } else {
                canvasEl.style.removeProperty('background-color');
            }

            if (capturedCanvas) {
                baseCtx.drawImage(capturedCanvas, 0, 0, targetW, targetH);
            }
        } catch(h2cErr) {
            console.warn("Hızlı sahne yakalama fallback:", h2cErr.message || h2cErr);
        }
    }

    // 5. Filigran / Watermark ekle
    if (typeof window.addWatermark === 'function') {
        try { await window.addWatermark(baseCanvas); } catch(e) {}
    }

    // Neon katmanını yeniden görünür yap (Tuval anında eski haline döner)
    if (saberView) saberView.style.visibility = 'visible';

    // ══════════════════════════════════════════════════
    // 4. ARKA PLANDA VİDEO KAYIT DÖNGÜSÜ BAŞLATILIYOR
    // ══════════════════════════════════════════════════
    // Yüzen progress widget'ını göster
    updateVideoToastProgress(0, durationSeconds.toFixed(1));

    // Animasyon ticker'ı açık tut
    const wasTickerStarted = saberApp && saberApp.ticker && saberApp.ticker.started;
    if (saberApp && saberApp.ticker && !saberApp.ticker.started) {
        saberApp.ticker.start();
    }

    // 5. KAYIT CANVAS'I VE MEDIARECORDER KURULUMU
    const recCanvas = document.createElement('canvas');
    recCanvas.width = targetW;
    recCanvas.height = targetH;
    const recCtx = recCanvas.getContext('2d', { alpha: false });
    recCtx.imageSmoothingEnabled = true;
    recCtx.imageSmoothingQuality = 'high';

    // İlk kareyi hemen çiz (CaptureStream'in canlı video track başlatması için)
    recCtx.drawImage(baseCanvas, 0, 0, targetW, targetH);
    if (saberApp && saberApp.view && saberApp.stage) {
        try {
            saberApp.renderer.render(saberApp.stage);
            recCtx.drawImage(saberApp.view, 0, 0, targetW, targetH);
        } catch(e) {}
    }

    // Yüksek Kalite / Bitrate Hesaplama:
    // 1080p: ~15 Mbps, 2K: ~24 Mbps, 4K UHD: ~35-40 Mbps
    const totalPixels = targetW * targetH;
    const videoBitrate = Math.round(Math.min(40000000, Math.max(14000000, totalPixels * 4.5)));

    const stream = recCanvas.captureStream(30);
    let recorder;
    try {
        recorder = new MediaRecorder(stream, {
            mimeType: chosenMime,
            videoBitsPerSecond: videoBitrate
        });
    } catch(recInitErr) {
        console.warn("Seçilen yüksek bitrate ile başlatılamadı, alternatif deneniyor:", recInitErr);
        try {
            recorder = new MediaRecorder(stream, {
                mimeType: chosenMime,
                videoBitsPerSecond: 12000000 // 12 Mbps
            });
        } catch(e2) {
            recorder = new MediaRecorder(stream);
        }
    }

    const chunks = [];
    recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = (e) => {
        console.error("MediaRecorder hata verdi:", e);
        finishVideoToastError("Video kaydı sırasında bir hata oluştu.");
    };

    // 6. ANİMASYON DÖNGÜSÜ VE KAYIT
    recorder.start(100);
    const startTs = performance.now();
    let animId = null;
    let timerId = null;

    return new Promise((resolve) => {
        const cleanup = () => {
            window.isExportingVideo = false;
            if (animId) cancelAnimationFrame(animId);
            if (timerId) clearTimeout(timerId);
            if (saberApp && saberApp.ticker && !wasTickerStarted) {
                saberApp.ticker.stop();
            }
        };

        recorder.onstop = () => {
            cleanup();

            try {
                const actualMime = recorder.mimeType || chosenMime;
                const blob = new Blob(chunks, { type: actualMime });
                console.log(`🎬 Video kaydı tamamlandı! Boyut: ${(blob.size / 1024).toFixed(1)} KB, MIME: ${actualMime}, Parça: ${chunks.length}`);

                if (!blob || blob.size === 0) {
                    console.error("Video blob boyutu 0!");
                    finishVideoToastError("Video verisi oluşturulamadı. Lütfen tekrar deneyin.");
                    resolve();
                    return;
                }

                const isMp4 = actualMime.toLowerCase().includes('mp4');
                const ext = isMp4 ? 'mp4' : 'webm';
                const fmtSafe = formatName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
                const filename = `emlak-studiom-animasyon-${fmtSafe}-${targetW}x${targetH}.${ext}`;
                const sizeMb = (blob.size / (1024 * 1024)).toFixed(1);

                const url = URL.createObjectURL(blob);

                // 1. Otomatik indirmeyi tetikle
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    if (a.parentNode) a.parentNode.removeChild(a);
                }, 2000);

                // 2. Yüzen widget'ı başarı durumuna geçir (Kullanıcı dilerse 'Hemen İndir' butonuna da basabilir)
                finishVideoToastSuccess(filename, sizeMb, url);
            } catch(err) {
                console.error("Video dosya oluşturma hatası:", err);
                finishVideoToastError("Video oluşturulurken hata: " + (err.message || err));
            }
            resolve();
        };

        function renderFrame(now) {
            const elapsed = now - startTs;
            if (elapsed >= durationMs) {
                if (recorder.state === 'recording') {
                    try { recorder.requestData(); } catch(e) {}
                    recorder.stop();
                }
                return;
            }

            // 1. Statik temel tasarımı çiz
            recCtx.imageSmoothingEnabled = true;
            recCtx.imageSmoothingQuality = 'high';
            recCtx.drawImage(baseCanvas, 0, 0, targetW, targetH);

            // 2. Canlı neon / saber animasyon katmanını çiz
            if (saberApp && saberApp.view && saberApp.stage) {
                try {
                    saberApp.renderer.render(saberApp.stage);
                    recCtx.drawImage(saberApp.view, 0, 0, targetW, targetH);
                } catch(e) {}
            }

            // 3. Yüzen toast ilerleme durumunu güncelle
            const pct = Math.min(99, Math.round((elapsed / durationMs) * 100));
            const remainingSec = Math.max(0, ((durationMs - elapsed) / 1000)).toFixed(1);
            updateVideoToastProgress(pct, remainingSec);

            // 4. Sonraki kare (arka planda sekme gizliyse setTimeout fallback ile devam eder)
            if (document.hidden) {
                timerId = setTimeout(() => renderFrame(performance.now()), 33);
            } else {
                animId = requestAnimationFrame(renderFrame);
            }
        }

        if (document.hidden) {
            timerId = setTimeout(() => renderFrame(performance.now()), 33);
        } else {
            animId = requestAnimationFrame(renderFrame);
        }
    });
}
// Global erişim için window üzerine bağlama
window.exportAnimatedVideo = exportAnimatedVideo;
window.closeVideoToast = closeVideoToast;
