/**
 * ============================================================
 * V8 EXPORT ENGINE - Native Canvas API Migration
 * ============================================================
 * 
 * MIMARI: html2canvas artÄ±k SADECE text/UI iÃ§in kullanÄ±lÄ±r.
 * FotoÄŸraflar native Canvas API ile Ã§izilir.
 * Koordinat hesabÄ± offsetLeft/offsetTop Ã¼zerinden yapÄ±lÄ±r.
 * 
 * Migration Phase: 0 (Cleanup)
 * Next Phase: 1 (Export Engine Rewrite)
 * ============================================================
 */
/**
 * ============================================
 * EXPORT & IMPORT MODULE
 * modules/export.js
 * ============================================
 * 
 * BaÃ„Å¸Ã„Â±mlÃ„Â±lÃ„Â±klar:
 * - config.js
 * - core/drag.js
 * 
 * KullanÃ„Â±lan yerler:
 * - main.js
 */

function isExportIgnoredElement(el) {
    if (!el) return false;
    if (el.id === 'photo-layer') return true;
    if (el.id === 'saber-layer') return true;
    if (el.id === 'three-d-layer') return true;
    if (el.id === 'threeDGizmoOverlay' || el.id === 'threeDCornerPinOverlay' || el.id === 'threeDCanvasBadge') return true;
    if (window.isExportingVideo && (el.id === 'draw-layer' || el.id === 'drawCanvas')) return true;
    if (el.id === 'export-loading-overlay') return true;
    if (el.id === 'app-custom-context-menu' || el.id === 'native-context-menu' || el.id === 'native-context-overlay') return true;

    // 🚫 Maske interaktif SVG katmanı ve tüm maske tutamaç/kılavuz elemanları (LIGHTROOM MASK GİZLEME)
    if (el.id === 'maskInteractiveSvg') return true;
    if (el.closest && el.closest('#maskInteractiveSvg')) return true;
    if (el.getAttribute && el.getAttribute('data-mask-action')) return true;
    if (el.hasAttribute && el.hasAttribute('data-mask-action')) return true;

    // Şeffaf PNG dışa aktarma modunda fotoğraf ve arka plan overlaylerini yoksay
    if (window.isExportingTransparent) {
        if (el.id === 'photo-layer' || (el.classList && el.classList.contains('photo-panel')) || (el.classList && el.classList.contains('cvr-bg-wrap')) || (el.classList && el.classList.contains('cvr-bg-img')) || (el.classList && el.classList.contains('kolaj-cell-img'))) return true;
        if (el.id === 'shadow-overlay' || el.id === 'highlight-overlay' || el.id === 'vignette-layer' || el.id === 'canva-render-layer') return true;
    }

    // 🚫 Gizli overlay katmanları (html2canvas'ın siyah gölge kutusu basmasını önler)
    if (el.id === 'shadow-overlay' || el.id === 'highlight-overlay' || el.id === 'vignette-layer' || el.id === 'mask-layer' || el.id === 'canva-render-layer') {
        if (el.style && (el.style.display === 'none' || el.style.visibility === 'hidden' || el.style.opacity === '0')) return true;
        if (typeof window.getComputedStyle === 'function') {
            try {
                const comp = window.getComputedStyle(el);
                if (comp.display === 'none' || comp.visibility === 'hidden' || comp.opacity === '0') return true;
            } catch(e){}
        }
    }

    // 🚫 Gizli şablon elemanları (elBadge, elPrice, elDetails, elLogo)
    if (el.id === 'elBadge' || el.id === 'elPrice' || el.id === 'elDetails' || el.id === 'elLogo') {
        if (el.style && (el.style.visibility === 'hidden' || el.style.display === 'none')) return true;
        if (typeof window.getComputedStyle === 'function') {
            try {
                const comp = window.getComputedStyle(el);
                if (comp.visibility === 'hidden' || comp.display === 'none') return true;
            } catch(e){}
        }
    }

    // 🚫 Genel gizli eleman kontrolü
    if (el.style && (el.style.display === 'none' || el.style.visibility === 'hidden')) return true;

    if (el.classList) {
        if (el.classList.contains('editable-draw')) return true;
        if (el.classList.contains('photo-inner-zoom')) return true;
        if (el.classList.contains('text-handle') ||
            el.classList.contains('text-lock-handle') ||
            el.classList.contains('text-resize-handle') ||
            el.classList.contains('text-rotate-handle') ||
            el.classList.contains('text-delete-handle') ||
            el.classList.contains('callout-lock-btn') ||
            el.classList.contains('callout-controls') ||
            el.classList.contains('callout-resizer') ||
            el.classList.contains('callout-rotator') ||
            el.classList.contains('callout-select-border') ||
            el.classList.contains('cbtn-del') ||
            el.classList.contains('draw-handle') ||
            el.classList.contains('vertex-handle') ||
            el.classList.contains('polygon-vertex') ||
            el.classList.contains('app-context-menu') ||
            el.classList.contains('draw-selection-box') ||
            el.classList.contains('cerceve-handle') ||
            el.classList.contains('kolaj-handle') ||
            el.classList.contains('kolaj-tutamac') ||
            el.classList.contains('tb-frame-handle') ||
            el.classList.contains('tb-frame-floating-tools') ||
            el.classList.contains('tb-floating-btn') ||
            el.classList.contains('tb-frame-file-input') ||
            el.classList.contains('tb-ic-close-btn') ||
            el.classList.contains('tb-pan-indicator') ||
            el.classList.contains('dock-contextual-bar')) {
            return true;
        }
    }
    return false;
}

function sanitizeExportClone(clonedDoc) {
    if (!clonedDoc) return;
    try {
        // 0. Tuval arka planını ve ölçek dönüşümünü klonda tamamen sıfırla (Beyaz kutu veya kayık ölçeklenmeyi kesinlikle önler)
        const clonedContainer = clonedDoc.getElementById('canvas-container');
        if (clonedContainer) {
            const origContainer = document.getElementById('canvas-container');
            const origW = origContainer ? (parseInt(origContainer.style.width) || origContainer.offsetWidth || 1920) : 1920;
            const origH = origContainer ? (parseInt(origContainer.style.height) || origContainer.offsetHeight || 1080) : 1080;
            clonedContainer.style.setProperty('background-color', 'transparent', 'important');
            clonedContainer.style.backgroundColor = 'transparent';
            clonedContainer.style.background = 'transparent';
            clonedContainer.style.transform = 'none';
            clonedContainer.style.webkitTransform = 'none';
            clonedContainer.style.position = 'relative';
            clonedContainer.style.left = '0px';
            clonedContainer.style.top = '0px';
            clonedContainer.style.width = origW + 'px';
            clonedContainer.style.height = origH + 'px';
            clonedContainer.style.margin = '0px';
            clonedContainer.style.padding = '0px';
            clonedContainer.style.overflow = 'hidden';
        }
        const clonedUi = clonedDoc.getElementById('ui-layer');
        if (clonedUi) {
            clonedUi.style.position = 'absolute';
            clonedUi.style.left = '0px';
            clonedUi.style.top = '0px';
            clonedUi.style.width = '100%';
            clonedUi.style.height = '100%';
            clonedUi.style.pointerEvents = 'none';
        }
        const clonedSaber = clonedDoc.getElementById('saber-layer');
        if (clonedSaber) clonedSaber.remove();
        clonedDoc.querySelectorAll('.editable-draw').forEach(el => el.remove());

        // 🚫 Maske interaktif SVG katmanı ve tüm maske tutamaç/kılavuz elemanlarını klondan koşulsuz ve kesin olarak temizle
        const clonedMaskSvg = clonedDoc.getElementById('maskInteractiveSvg');
        if (clonedMaskSvg) clonedMaskSvg.remove();
        clonedDoc.querySelectorAll('#maskInteractiveSvg, [data-mask-action]').forEach(el => el.remove());

        if (window.isExportingVideo) {
            const clonedDraw = clonedDoc.getElementById('draw-layer') || clonedDoc.getElementById('drawCanvas');
            if (clonedDraw) clonedDraw.remove();
            const clonedPhoto = clonedDoc.getElementById('photo-layer');
            if (clonedPhoto) clonedPhoto.remove();
        }

        if (window.isExportingTransparent) {
            const clonedPhoto = clonedDoc.getElementById('photo-layer');
            if (clonedPhoto) clonedPhoto.remove();
            clonedDoc.querySelectorAll('.photo-panel, .photo-render-canvas, .cvr-bg-wrap, .cvr-bg-img, .kolaj-cell-img, #shadow-overlay, #highlight-overlay, #vignette-layer, #canva-render-layer').forEach(el => el.remove());
        }

        // 🚫 Şablon çerçeve tutamaçları, yüzen araçlar, bilgi kartı kapat butonu ve tuval altı dock'u klondan temizle
        clonedDoc.querySelectorAll('.tb-frame-handle, .tb-frame-floating-tools, .tb-floating-btn, .tb-frame-file-input, .tb-ic-close-btn, .tb-pan-indicator, #canvasBottomDock, .dock-contextual-bar').forEach(el => el.remove());
        clonedDoc.querySelectorAll('.tb-frame-selected, .el-selected, .selected').forEach(el => {
            el.classList.remove('tb-frame-selected', 'el-selected', 'selected');
            if (el.style) {
                el.style.outline = 'none';
                const sh = el.dataset?.shadowVal;
                if (!sh || +sh === 0) {
                    el.style.boxShadow = 'none';
                }
            }
        });
        clonedDoc.querySelectorAll('.tb-frame-placeholder').forEach(el => {
            const parentFrame = el.closest('.tb-frame-item') || el.closest('.tb-image-frame');
            if (parentFrame && (parentFrame.classList.contains('has-image') || parentFrame.querySelector('.tb-frame-img') || parentFrame.querySelector('.tb-frame-export-canvas'))) {
                el.remove();
            }
        });

        // 1. Dışa aktarma maskesi ve loading pencerelerini klondan derhal temizle
        const globalMask = clonedDoc.getElementById('download-overlay-mask');
        if (globalMask) globalMask.remove();
        const exportLoader = clonedDoc.getElementById('export-loading-overlay');
        if (exportLoader) exportLoader.remove();

        // 2. Gizli veya kapalı tüm şablon, overlay ve arayüz kontrol elemanlarını klondan tamamen kaldır
        const hiddenSelectors = [
            '#download-overlay-mask', '#export-loading-overlay', '#canvasBottomDock',
            '#threeDGizmoOverlay', '#threeDCornerPinOverlay', '#threeDCanvasBadge',
            '#shadow-overlay', '#highlight-overlay', '#vignette-layer', '#mask-layer', '#maskInteractiveSvg',
            '#canva-render-layer', '#app-custom-context-menu', '#native-context-menu', '#native-context-overlay',
            '#elBadge', '#elPrice', '#elDetails', '#elLogo',
            '.text-handle', '.text-lock-handle', '.text-resize-handle', '.text-rotate-handle', '.text-delete-handle',
            '.callout-lock-btn', '.callout-controls', '.callout-resizer', '.callout-rotator', '.callout-select-border', '.callout-handle-width', '.callout-handle-length',
            '.cbtn-del', '.draw-handle', '.vertex-handle', '.polygon-vertex', '.app-context-menu', '.draw-selection-box',
            '.cerceve-handle', '.kolaj-handle', '.kolaj-tutamac', '#cerceveEditor',
            '.photo-inner-zoom',
            '.tb-frame-handle', '.tb-frame-floating-tools', '.tb-floating-btn', '.tb-frame-file-input', '.tb-ic-close-btn', '.tb-pan-indicator', '.tb-swap-badge', '.dock-contextual-bar'
        ];
        
        hiddenSelectors.forEach(sel => {
            clonedDoc.querySelectorAll(sel).forEach(node => {
                const isControlOrHandle = (node.id === 'maskInteractiveSvg') || (node.getAttribute && node.getAttribute('data-mask-action')) || (node.classList && (
                    node.classList.contains('text-handle') || node.classList.contains('callout-controls') ||
                    node.classList.contains('callout-resizer') || node.classList.contains('callout-rotator') ||
                    node.classList.contains('callout-select-border') || node.classList.contains('callout-lock-btn') ||
                    node.classList.contains('callout-handle-width') || node.classList.contains('callout-handle-length') ||
                    node.classList.contains('cbtn-del') || node.classList.contains('draw-handle') ||
                    node.classList.contains('vertex-handle') || node.classList.contains('polygon-vertex') ||
                    node.classList.contains('cerceve-handle') || node.classList.contains('kolaj-handle') ||
                    node.classList.contains('kolaj-tutamac') ||
                    node.classList.contains('photo-inner-zoom')
                ));

                // Orijinal DOM'daki gerçek duruma ve klondaki duruma bak
                let isHidden = false;
                if (node.style && (node.style.display === 'none' || node.style.visibility === 'hidden' || node.style.opacity === '0')) {
                    isHidden = true;
                }
                const orig = node.id ? document.getElementById(node.id) : null;
                if (!isHidden && orig && typeof window.getComputedStyle === 'function') {
                    try {
                        const comp = window.getComputedStyle(orig);
                        if (comp.display === 'none' || comp.visibility === 'hidden' || comp.opacity === '0') {
                            isHidden = true;
                        }
                    } catch(e) {}
                }
                if (!isHidden && clonedDoc.defaultView && typeof clonedDoc.defaultView.getComputedStyle === 'function') {
                    try {
                        const comp = clonedDoc.defaultView.getComputedStyle(node);
                        if (comp && (comp.display === 'none' || comp.visibility === 'hidden' || comp.opacity === '0')) {
                            isHidden = true;
                        }
                    } catch(e) {}
                }

                if (node.id === 'mask-layer' && !node.style.backgroundImage && (!orig || !orig.style.backgroundImage)) {
                    isHidden = true;
                }
                if (node.id === 'cerceveEditor' || node.id === 'export-loading-overlay' || node.id === 'download-overlay-mask') {
                    isHidden = true;
                }

                if (isControlOrHandle || isHidden) {
                    node.remove();
                }
            });
        });

        // Kolaj çerçevelerindeki aktif seçim mavi/cyan kesikli çizgisini temizle
        clonedDoc.querySelectorAll('.kolaj-cerceve').forEach(node => {
            if (node.style) {
                node.style.outline = 'none';
            }
        });

        // 3. html2canvas UYUMLULUK TEMİZLİĞİ (Gölge, Çerçeve, Buzlu Cam ve Blur Sanitizasyonu):
        // a) html2canvas 'backdrop-filter' desteklemez ve doğrudan bırakıldığında leke/siyah kutu basar.
        //    Buzlu cam (frosted glass) elemanlarında backdrop-filter temizlendiğinde, elemanın opak/yarı saydam
        //    beyaz zemini fotoğraf üzerinde sisli, süt gibi mat bir leke oluşturur.
        //    Bunu önlemek için: Buzlu cam elemanları algılanır, sisli mat zemin kristal cam berraklığına
        //    (zarif gradyan, 1px net cam kenarlığı ve hafif derinlik gölgesi) dönüştürülür.
        // b) Standart metin ve rozet elemanlarında html2canvas'ın kirli koyu leke/hale basmasını önlemek
        //    için aşırı yayılmalı gölgeler temizlenir, spread gölgeler ise net kenarlığa (border) çevrilir.
        const allNodes = clonedDoc.querySelectorAll('*');
        allNodes.forEach(node => {
            if (node.style) {
                const origNode = node.id ? document.getElementById(node.id) : null;
                const rawBackdrop = (node.style.backdropFilter || node.style.webkitBackdropFilter || '') ||
                                    (origNode && origNode.style ? (origNode.style.backdropFilter || origNode.style.webkitBackdropFilter || '') : '');
                const blurVal = parseFloat(node.dataset ? node.dataset.blurVal : 0) || (origNode && origNode.dataset ? parseFloat(origNode.dataset.blurVal) : 0);
                const hasGlassClass = node.className && typeof node.className === 'string' && (node.className.includes('glass') || node.className.includes('cvr-glass'));
                const isFrostedGlass = (rawBackdrop && rawBackdrop.includes('blur')) || blurVal > 0 || hasGlassClass;

                if (node.style.backdropFilter) node.style.backdropFilter = 'none';
                if (node.style.webkitBackdropFilter) node.style.webkitBackdropFilter = 'none';

                if (isFrostedGlass) {
                    // Buzlu cam sisli/mat görünümünü engelleme:
                    const bg = node.style.background || node.style.backgroundColor || (origNode && origNode.style ? (origNode.style.background || origNode.style.backgroundColor) : '') || '';
                    const rgbaMatch = bg.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/i);
                    if (rgbaMatch) {
                        const r = parseInt(rgbaMatch[1]), g = parseInt(rgbaMatch[2]), b = parseInt(rgbaMatch[3]);
                        const a = parseFloat(rgbaMatch[4]);
                        if (r > 150 && g > 150 && b > 150) {
                            // Açık tonlu / beyaz buzlu cam: Mat sis lekesini kaldırıp arkadaki fotoğrafı berrak gösteren zarif kristal cam ışıltısı ver
                            node.style.background = `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.16) 0%, rgba(${r}, ${g}, ${b}, 0.06) 100%)`;
                            node.style.backgroundColor = 'transparent';
                        } else if (a > 0.6) {
                            // Koyu cam: Transparanlığını koru
                            node.style.background = `rgba(${r}, ${g}, ${b}, 0.82)`;
                        }
                    } else if (bg.includes('255, 255, 255') || bg.includes('255,255,255') || bg === '#ffffff' || bg === 'white') {
                        node.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.06) 100%)';
                        node.style.backgroundColor = 'transparent';
                    }

                    // Cam kenarını jilet gibi berraklaştır
                    if (!node.style.border || node.style.border === 'none' || node.style.border === '') {
                        node.style.border = '1px solid rgba(255, 255, 255, 0.35)';
                    }

                    // Buzlu camın mat/düz kalmaması için doğal cam derinliği ver
                    node.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.14)';
                } else {
                    // Normal elemanlarda box-shadow sanitizasyonu (html2canvas şeffaf tuval uyumluluğu)
                    const rawShadow = node.style.boxShadow;
                    if (rawShadow && rawShadow !== 'none' && rawShadow !== '') {
                        // Spread-border kontrolü: Örn "0 0 0 1px rgba(245,158,11,.3)" gibi gölgeler gerçekte kenarlıktır
                        const shadowParts = rawShadow.split(/,(?![^(]*\))/).map(s => s.trim());
                        shadowParts.forEach(part => {
                            const spreadMatch = part.match(/0(?:px)?\s+0(?:px)?\s+0(?:px)?\s+([\d.]+)px\s+(.+)/);
                            if (spreadMatch && (!node.style.border || node.style.border === 'none' || node.style.border === '')) {
                                node.style.border = `${spreadMatch[1]}px solid ${spreadMatch[2]}`;
                            }
                        });

                        // Standart şablon öğeleri (elBadge, elPrice, elDetails) ve tuval elemanlarında
                        // html2canvas'ın kirli koyu siyah leke/hale basmasını engellemek için
                        // gölgeleri tamamen temizle. Öğelerin kendi parlak renkleri ve altın çerçeveleri jilet gibi net kalsın.
                        node.style.boxShadow = 'none';
                    }
                }
            }
        });
    } catch (e) {
        console.warn("Clone sanitization error:", e);
    }
}


let _appLoadingTimeout = null;
function showAppLoading(title = 'İşlem Yapılıyor...', subtitle = 'Lütfen bekleyin...', timeoutMs = 8000) {
    if (_appLoadingTimeout) clearTimeout(_appLoadingTimeout);
    let overlay = document.getElementById('export-loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'export-loading-overlay';
        overlay.innerHTML = `
            <div class="export-loader-card">
                <div class="export-loader-spinner"></div>
                <div class="export-content-wrapper">
                    <div class="export-loader-title">${title}</div>
                    <div class="export-loader-sub">${subtitle}</div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    } else {
        const titleEl = overlay.querySelector('.export-loader-title');
        const subEl = overlay.querySelector('.export-loader-sub');
        if (titleEl) titleEl.textContent = title;
        if (subEl) subEl.textContent = subtitle;
        overlay.style.display = 'flex';
    }
    void overlay.offsetWidth;
    overlay.classList.add('active');

    // Güvenlik zaman aşımı (loading sonsuza kadar kalmasın)
    _appLoadingTimeout = setTimeout(() => {
        hideAppLoading(0, true);
    }, timeoutMs);
}

function showExportLoading(title = 'Görsel Hazırlanıyor...', subtitle = 'Yüksek çözünürlüklü grafikler ve fontlar işleniyor...') {
    // Export işlemi 4K veya detaylı olabileceğinden 60 saniye süre verilir
    showAppLoading(title, subtitle, 60000);
}

function hideAppLoading(delay = 0, force = false) {
    // Export işlemi sürerken ara fonksiyonların loader'ı kapatmasını engelle
    if (!force && document.body && document.body.classList.contains('is-exporting')) {
        return;
    }
    if (_appLoadingTimeout) {
        clearTimeout(_appLoadingTimeout);
        _appLoadingTimeout = null;
    }
    const doHide = () => {
        const overlay = document.getElementById('export-loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay && !overlay.classList.contains('active')) {
                    overlay.remove();
                }
            }, 240);
        }
    };
    if (delay > 0) {
        setTimeout(doHide, delay);
    } else {
        doHide();
    }
}

window.showAppLoading = showAppLoading;
window.hideAppLoading = hideAppLoading;
window.showExportLoading = showExportLoading;
window.hideExportLoading = (delay = 0, force = false) => hideAppLoading(delay, force);

/**
 * 3D WebGL Katmanını (#three-d-layer) hedef canvas contextine çizer.
 * ThreeDEngine aktifse yüksek çözünürlüklü native render alır ve gizmolardan arındırır.
 */
function draw3DLayerToContext(targetCtx, targetW, targetH) {
    if (!targetCtx) return;
    if (window.ThreeDEngine && window.ThreeDEngine.state && window.ThreeDEngine.state.visible === false) return;
    const threeDCanvas = document.getElementById('three-d-layer');
    if (!threeDCanvas || threeDCanvas.style.display === 'none' || !threeDCanvas.width) return;

    if (window.ThreeDEngine && typeof window.ThreeDEngine.prepareForExport === 'function') {
        try {
            const exp = window.ThreeDEngine.prepareForExport(targetW, targetH);
            if (exp && exp.canvas) {
                targetCtx.drawImage(exp.canvas, 0, 0, targetW, targetH);
                exp.restore();
                return;
            }
        } catch (err) {
            console.warn('[Export] ThreeDEngine.prepareForExport hatası, doğrudan çizime dönülüyor:', err);
        }
    }

    try {
        targetCtx.drawImage(threeDCanvas, 0, 0, targetW, targetH);
    } catch(e) {
        console.warn('[Export] 3D katman aktarılırken hata:', e);
    }
}

/**
 * PixiJS Saber Katmanını (#saber-layer) hedef canvas contextine çizer.
 * SaberEngine aktifse yüksek çözünürlüklü native render alır.
 */
function drawSaberLayerToContext(targetCtx, targetW, targetH, outputScale, currentW, currentH) {
    if (!targetCtx) return;
    if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
        const saberApp = window.SaberEngine.getApp();
        if (saberApp && saberApp.view) {
            if (saberApp.renderer && saberApp.stage) {
                try {
                    saberApp.renderer.resize(targetW, targetH);
                    saberApp.stage.scale.set(outputScale || 1);
                    saberApp.renderer.render(saberApp.stage);
                    targetCtx.save();
                    targetCtx.drawImage(saberApp.view, 0, 0, targetW, targetH);
                    targetCtx.restore();
                    saberApp.renderer.resize(currentW || targetW, currentH || targetH);
                    saberApp.stage.scale.set(1);
                    saberApp.renderer.render(saberApp.stage);
                    saberApp.view.style.width = '100%';
                    saberApp.view.style.height = '100%';
                } catch (e) {
                    console.warn('[Export] Saber render hatası:', e);
                }
            } else {
                try {
                    targetCtx.drawImage(saberApp.view, 0, 0, targetW, targetH);
                } catch (e) {}
            }
        }
    }
}

/**
 * 3D (#three-d-layer) ve Saber (#saber-layer) katmanlarını aralarındaki gerçek z-index derinlik sırasına göre basar.
 */
function draw3DAndSaberToContext(targetCtx, targetW, targetH, outputScale, currentW, currentH) {
    const cvs3D = document.getElementById('three-d-layer') || (window.ThreeDEngine && window.ThreeDEngine.getCanvas ? window.ThreeDEngine.getCanvas() : null);
    const cvsSaber = document.getElementById('saber-layer');

    const getZ = (el, fallback) => {
        if (!el) return fallback;
        const raw = el.dataset?.layerZIndex || el.style?.getPropertyValue?.('z-index') || el.style?.zIndex;
        const parsed = parseInt(raw, 10);
        return (!isNaN(parsed) && parsed < 900) ? parsed : fallback;
    };

    const z3D = getZ(cvs3D, 54);
    const zSaber = getZ(cvsSaber, 55);

    if (z3D > zSaber) {
        drawSaberLayerToContext(targetCtx, targetW, targetH, outputScale, currentW, currentH);
        draw3DLayerToContext(targetCtx, targetW, targetH);
    } else {
        draw3DLayerToContext(targetCtx, targetW, targetH);
        drawSaberLayerToContext(targetCtx, targetW, targetH, outputScale, currentW, currentH);
    }
}

/**
 * Tuvaldeki 2D DOM ögelerini (html2canvas), 3D WebGL katmanını ve PixiJS Saber katmanını
 * Katmanlar panelindeki ve ekrandaki gerçek z-index derinlik sırasına göre hedef context'e çizer.
 */
async function compositeContentLayersInZOrder({
    targetCtx,
    canvasEl,
    targetW,
    targetH,
    outputScale,
    currentW,
    currentH,
    supersamplingScale,
    isTransparent = false,
    bgColor = null,
    isTemplateMode = false
}) {
    const cvs3D = document.getElementById('three-d-layer') || (window.ThreeDEngine && window.ThreeDEngine.getCanvas ? window.ThreeDEngine.getCanvas() : null);
    const cvsSaber = document.getElementById('saber-layer');

    const getZ = (el, fallback) => {
        if (!el) return fallback;
        const raw = el.dataset?.layerZIndex || el.style?.getPropertyValue?.('z-index') || el.style?.zIndex;
        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed)) {
            if (parsed >= 900) return 60;
            return parsed;
        }
        return fallback;
    };

    const has3D = !!(cvs3D && cvs3D.style.display !== 'none' && (!window.ThreeDEngine || (window.ThreeDEngine.state && window.ThreeDEngine.state.visible !== false)));
    const hasSaber = !!(cvsSaber && cvsSaber.style.display !== 'none' && window.SaberEngine && typeof window.SaberEngine.getApp === 'function');

    const z3D = has3D ? getZ(cvs3D, 35) : -999;
    const zSaber = hasSaber ? getZ(cvsSaber, 30) : -999;

    const draw3D = () => {
        if (has3D) draw3DLayerToContext(targetCtx, targetW, targetH);
    };

    const drawSaber = () => {
        if (hasSaber) drawSaberLayerToContext(targetCtx, targetW, targetH, outputScale, currentW, currentH);
    };

    // 2D DOM elemanlarını topla (Görünür olanlar)
    const raw2DEls = Array.from(canvasEl.querySelectorAll('.canvas-el, .draggable, .callout-wrap, .tb-image-frame, [data-layer-uid]'))
        .filter(el => {
            if (el.id === 'photo-layer' || el.id === 'saber-layer' || el.id === 'three-d-layer') return false;
            if (isExportIgnoredElement(el)) return false;
            if (el.dataset?.hiddenLayer === 'true') return false;
            if (el.style.display === 'none' || el.style.visibility === 'hidden') return false;
            if (el.classList.contains('normal-el') || el.id === 'elBadge' || el.id === 'elPrice' || el.id === 'elDetails' || el.id === 'elTitle') {
                if (!el.querySelector('img') && !el.querySelector('svg') && el.innerText.trim() === '') return false;
            }
            return true;
        });

    const hasTemplateFrame = isTemplateMode || !!canvasEl.querySelector('.cvr-base, .kolaj-wrapper, .photo-panel');

    // Görsel DOM içeriği olan 2D elemanlar (neon metinler PixiJS tarafından çizilir)
    const visual2DEls = raw2DEls.filter(el => !el.classList.contains('neon-text-el') && el.dataset?.saberActive !== 'true');

    // html2canvas render yardımcı fonksiyonu
    const renderHtml2CanvasPass = async (filterFn = null) => {
        return await html2canvas(canvasEl, {
            width: currentW,
            height: currentH,
            scale: supersamplingScale,
            useCORS: true,
            allowTaint: false,
            imageTimeout: 0,
            logging: false,
            backgroundColor: (!isTransparent && bgColor && bgColor !== 'transparent' && hasTemplateFrame) ? bgColor : null,
            ignoreElements: (el) => {
                if (isExportIgnoredElement(el)) return true;
                if (filterFn) return filterFn(el);
                return false;
            },
            onclone: (clonedDoc) => sanitizeExportClone(clonedDoc)
        });
    };

    // Eğer 3D de Saber da yoksa: Doğrudan tek geçiş html2canvas çiz
    if (!has3D && !hasSaber) {
        const h2c = await renderHtml2CanvasPass();
        targetCtx.drawImage(h2c, 0, 0, targetW, targetH);
        return;
    }

    // Harici katmanları hazırla ve z-index değerine göre artan sırada (alttan üste) sırala
    const externalLayers = [];
    if (hasSaber) externalLayers.push({ type: 'saber', zIndex: zSaber, draw: drawSaber });
    if (has3D) externalLayers.push({ type: 'threeD', zIndex: z3D, draw: draw3D });
    externalLayers.sort((a, b) => a.zIndex - b.zIndex);

    // Eğer hiç 2D eleman yoksa: Sadece harici katmanları sırayla çiz
    if (visual2DEls.length === 0 && !hasTemplateFrame) {
        externalLayers.forEach(l => l.draw());
        return;
    }

    // 2D elemanların z-index değerleri
    const z2DValues = visual2DEls.map(el => getZ(el, 20));
    const min2DZ = z2DValues.length > 0 ? Math.min(...z2DValues) : 20;
    const max2DZ = z2DValues.length > 0 ? Math.max(...z2DValues) : 20;

    const minExtZ = externalLayers[0].zIndex;
    const maxExtZ = externalLayers[externalLayers.length - 1].zIndex;

    // DURUM 1: Tüm 2D elemanlar harici katmanların ÜZERİNDE (Örn: Özel Kutu z=40 > 3D z=35 > Saber z=30)
    if (min2DZ >= maxExtZ && !hasTemplateFrame) {
        externalLayers.forEach(l => l.draw());
        const h2c = await renderHtml2CanvasPass();
        targetCtx.drawImage(h2c, 0, 0, targetW, targetH);
        return;
    }

    // DURUM 2: Tüm 2D elemanlar harici katmanların ALTINDA (Örn: Özel Kutu z=20 < 3D z=35 < Saber z=40)
    if (max2DZ <= minExtZ) {
        const h2c = await renderHtml2CanvasPass();
        targetCtx.drawImage(h2c, 0, 0, targetW, targetH);
        externalLayers.forEach(l => l.draw());
        return;
    }

    // DURUM 3: 2D elemanlar iki harici katmanın ARASINDA (Örn: Saber z=30 < Özel Kutu z=35 < 3D z=40)
    if (externalLayers.length === 2 && min2DZ >= minExtZ && max2DZ <= maxExtZ && !hasTemplateFrame) {
        externalLayers[0].draw();
        const h2c = await renderHtml2CanvasPass();
        targetCtx.drawImage(h2c, 0, 0, targetW, targetH);
        externalLayers[1].draw();
        return;
    }

    // DURUM 4: Elemanlar harici katmanlarla sandviç / iç içe (Bazı 2D ögeler altta, bazıları aralarda veya üstte)
    if (externalLayers.length === 1) {
        const splitZ = externalLayers[0].zIndex;
        
        // Alt katman 2D elemanlar (splitZ altındakiler)
        const h2cBottom = await renderHtml2CanvasPass((el) => {
            if (el.id === 'canvas-container' || el.id === 'ui-layer' || el.id === 'workArea' || el.classList?.contains('main-canvas')) return false;
            const contentEl = (el.classList?.contains('canvas-el') || el.classList?.contains('draggable') || el.classList?.contains('callout-wrap') || el.classList?.contains('tb-image-frame') || el.hasAttribute?.('data-layer-uid'))
                ? el
                : el.closest?.('.canvas-el, .draggable, .callout-wrap, .tb-image-frame, [data-layer-uid]');
            if (contentEl) {
                const z = getZ(contentEl, 20);
                if (z >= splitZ) return true;
            }
            return false;
        });
        targetCtx.drawImage(h2cBottom, 0, 0, targetW, targetH);

        // Harici katmanı çiz
        externalLayers[0].draw();

        // Üst katman 2D elemanlar (splitZ ve üstündekiler)
        const h2cTop = await renderHtml2CanvasPass((el) => {
            if (el.id === 'canvas-container' || el.id === 'ui-layer' || el.id === 'workArea' || el.classList?.contains('main-canvas')) return false;
            const contentEl = (el.classList?.contains('canvas-el') || el.classList?.contains('draggable') || el.classList?.contains('callout-wrap') || el.classList?.contains('tb-image-frame') || el.hasAttribute?.('data-layer-uid'))
                ? el
                : el.closest?.('.canvas-el, .draggable, .callout-wrap, .tb-image-frame, [data-layer-uid]');
            if (contentEl) {
                const z = getZ(contentEl, 20);
                if (z < splitZ) return true;
            }
            return false;
        });
        targetCtx.drawImage(h2cTop, 0, 0, targetW, targetH);
    } else {
        // İki harici katman var (Örn: Saber ve 3D)
        const z0 = externalLayers[0].zIndex;
        const z1 = externalLayers[1].zIndex;

        // 1. z0 altındaki 2D elemanlar
        const h2cBottom = await renderHtml2CanvasPass((el) => {
            if (el.id === 'canvas-container' || el.id === 'ui-layer' || el.id === 'workArea' || el.classList?.contains('main-canvas')) return false;
            const contentEl = (el.classList?.contains('canvas-el') || el.classList?.contains('draggable') || el.classList?.contains('callout-wrap') || el.classList?.contains('tb-image-frame') || el.hasAttribute?.('data-layer-uid'))
                ? el
                : el.closest?.('.canvas-el, .draggable, .callout-wrap, .tb-image-frame, [data-layer-uid]');
            if (contentEl) {
                const z = getZ(contentEl, 20);
                if (z >= z0) return true;
            }
            return false;
        });
        targetCtx.drawImage(h2cBottom, 0, 0, targetW, targetH);

        // 2. İlk harici katman
        externalLayers[0].draw();

        // 3. z0 ile z1 arasındaki 2D elemanlar (varsa)
        const hasBetween = visual2DEls.some(el => {
            const z = getZ(el, 20);
            return z >= z0 && z < z1;
        });
        if (hasBetween) {
            const h2cMid = await renderHtml2CanvasPass((el) => {
                if (el.id === 'canvas-container' || el.id === 'ui-layer' || el.id === 'workArea' || el.classList?.contains('main-canvas')) return false;
                const contentEl = (el.classList?.contains('canvas-el') || el.classList?.contains('draggable') || el.classList?.contains('callout-wrap') || el.classList?.contains('tb-image-frame') || el.hasAttribute?.('data-layer-uid'))
                    ? el
                    : el.closest?.('.canvas-el, .draggable, .callout-wrap, .tb-image-frame, [data-layer-uid]');
                if (contentEl) {
                    const z = getZ(contentEl, 20);
                    if (z < z0 || z >= z1) return true;
                }
                return false;
            });
            targetCtx.drawImage(h2cMid, 0, 0, targetW, targetH);
        }

        // 4. İkinci harici katman
        externalLayers[1].draw();

        // 5. z1 ve üstündeki 2D elemanlar (varsa)
        const hasTop = visual2DEls.some(el => getZ(el, 20) >= z1);
        if (hasTop) {
            const h2cTop = await renderHtml2CanvasPass((el) => {
                if (el.id === 'canvas-container' || el.id === 'ui-layer' || el.id === 'workArea' || el.classList?.contains('main-canvas')) return false;
                const contentEl = (el.classList?.contains('canvas-el') || el.classList?.contains('draggable') || el.classList?.contains('callout-wrap') || el.classList?.contains('tb-image-frame') || el.hasAttribute?.('data-layer-uid'))
                    ? el
                    : el.closest?.('.canvas-el, .draggable, .callout-wrap, .tb-image-frame, [data-layer-uid]');
                if (contentEl) {
                    const z = getZ(contentEl, 20);
                    if (z < z1) return true;
                }
                return false;
            });
            targetCtx.drawImage(h2cTop, 0, 0, targetW, targetH);
        }
    }
}

function switchPreviewFormat(){
    const formatName=$('previewFormat').value;
    const format=EXPORT_FORMATS[formatName];
    if(!format) {
        hideAppLoading();
        return;
    }

    document.querySelectorAll('.dock-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.format === formatName);
    });

    const oldW = parseInt(canvasEl.style.width) || 1920;
    const oldH = parseInt(canvasEl.style.height) || 1080;
    const newW = format.w;
    const newH = format.h;

    // Şık yükleme ekranı göster (sessiz modda açma)
    if (!window.isInitialLoad && !window._suppressFormatLoading) {
        showAppLoading('Format Ayarlanıyor...', 'Tuval ve katmanlar yeni boyuta uyarlanıyor...');
    }

    const oldPhotoState = window.getCurrentPhotoState ? window.getCurrentPhotoState() : null;

    canvasEl.style.width=format.w+'px';
    canvasEl.style.height=format.h+'px';
    drawCanvas.width=format.w;
    drawCanvas.height=format.h;
    drawCanvas.style.width=format.w+'px';
    drawCanvas.style.height=format.h+'px';

    // Saber canvas resize
    if (window.SaberEngine && typeof SaberEngine.resize === 'function') {
        SaberEngine.resize(format.w, format.h);
    }

    if (window.isRestoringState === true) {
        hideAppLoading();
        return;
    }
    
    // Scale and adapt custom draggable items immediately
    if (oldW && oldH && newW && newH && (oldW !== newW || oldH !== newH)) {
        try {
            const isTemplateMode = (typeof isCanvaMode !== 'undefined' && isCanvaMode);

            // 1. Canva Şablonu Aktifse, şablonu yeni formata göre TAM BOYUTTA yeniden oluştur
            if (isTemplateMode && typeof refreshActiveCanvaTemplate === 'function') {
                refreshActiveCanvaTemplate();
            } else if (!isTemplateMode && typeof activeLayout !== 'undefined' && activeLayout && typeof TPL !== 'undefined' && TPL[activeLayout]) {
                // Standart Şablon (Giriş sekmesi) aktifse yeni format boyutlarına göre tam oranla
                const t = TPL[activeLayout];
                if (typeof elBadge !== 'undefined' && elBadge && t.badge) applyStylePos(elBadge, t.badge);
                if (typeof elPrice !== 'undefined' && elPrice && t.price) applyStylePos(elPrice, t.price);
                if (typeof elDetails !== 'undefined' && elDetails && t.details) applyStylePos(elDetails, t.details);
                if (typeof elLogo !== 'undefined' && elLogo && t.logo) applyStylePos(elLogo, t.logo);
            }

            // 2. Fotoğraf panellerini güncelle ve native canvas'a çiz (redrawAll tetiklenir)
            document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => { 
                if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p); 
            });
            
            const newPhotoState = window.getCurrentPhotoState ? window.getCurrentPhotoState() : null;
            
            // Select only user-added UI text items (Callouts, Neon Blocks, Free Texts, Icons)
            const customItems = document.querySelectorAll('#canvas-container .draggable, #canvas-container .callout-wrap, #canvas-container .co-neon-block');
            
            let tParams = null;
            if (oldPhotoState && newPhotoState && typeof calculateTransformParams === 'function') {
                tParams = calculateTransformParams(oldPhotoState, newPhotoState);
            }
            
            if (window.isRestoringState !== true) {
                customItems.forEach(el => {
                    // Skip standard template elements and canva panels
                    if (el.id === 'elBadge' || el.id === 'elPrice' || el.id === 'elDetails' || el.id === 'elLogo' || 
                        el.classList.contains('normal-el') || el.classList.contains('canva-generated') || el.classList.contains('canva-panel')) return;

                    const isWrap = el.classList.contains('callout-wrap') || el.classList.contains('co-neon-block') || el.classList.contains('svg-callout');
                    
                    el.style.maxWidth = 'none';
                    if (isWrap) {
                        el.style.whiteSpace = 'nowrap';
                    }
                    
                    void el.offsetHeight;
                    
                    if (isTemplateMode) {
                        if (tParams) {
                            const oldLeft = parseFloat(el.style.left || 0);
                            const oldTop = parseFloat(el.style.top || 0);
                            
                            if (isWrap) {
                                const W = parseFloat(el.style.width) || el.offsetWidth || 0;
                                const H = parseFloat(el.style.height) || el.offsetHeight || 0;
                                
                                const cx_old = oldLeft + W / 2;
                                const cy_old = oldTop + H / 2;
                                
                                const cx_new = cx_old * tParams.scale + tParams.dx;
                                const cy_new = cy_old * tParams.scale + tParams.dy;
                                
                                el.style.left = (cx_new - W / 2) + 'px';
                                el.style.top = (cy_new - H / 2) + 'px';
                                
                                const currentScale = parseFloat(el.dataset.scale) || 1;
                                const newScale = currentScale * tParams.scale;
                                el.dataset.scale = newScale;
                                const rot = el.dataset.rotation || 0;
                                el.style.transform = `rotate(${rot}deg) scale(${newScale})`;
                            } else {
                                el.style.left = (oldLeft * tParams.scale + tParams.dx) + 'px';
                                el.style.top = (oldTop * tParams.scale + tParams.dy) + 'px';
                                
                                if (el.style.width) el.style.width = (parseFloat(el.style.width) * tParams.scale) + 'px';
                                if (el.style.height) el.style.height = (parseFloat(el.style.height) * tParams.scale) + 'px';
                                if (el.style.fontSize) el.style.fontSize = (parseFloat(el.style.fontSize) * tParams.scale) + 'px';
                                if (el.style.padding) el.style.padding = (parseFloat(el.style.padding) * tParams.scale) + 'px';
                            }
                        }
                    } else {
                        const oldLeft = parseFloat(el.style.left || 0);
                        const oldTop = parseFloat(el.style.top || 0);
                        const W = parseFloat(el.style.width) || el.offsetWidth || 0;
                        const H = parseFloat(el.style.height) || el.offsetHeight || 0;
                        
                        if (isWrap) {
                            const cx_old = oldLeft + W / 2;
                            const cy_old = oldTop + H / 2;
                            
                            const percX = cx_old / oldW;
                            const percY = cy_old / oldH;
                            
                            const cx_new = percX * newW;
                            const cy_new = percY * newH;
                            
                            el.style.left = (cx_new - W / 2) + 'px';
                            el.style.top = (cy_new - H / 2) + 'px';
                        } else {
                            const percX = oldLeft / oldW;
                            const percY = oldTop / oldH;
                            
                            el.style.left = (percX * newW) + 'px';
                            el.style.top = (percY * newH) + 'px';
                        }
                        
                        if (!el.dataset.origCanvasW) {
                            el.dataset.origCanvasW = oldW;
                            el.dataset.origCanvasH = oldH;
                        }
                        const origW = parseFloat(el.dataset.origCanvasW) || 1920;
                        const origH = parseFloat(el.dataset.origCanvasH) || 1080;
                        
                        const oldFormatScale = Math.min(oldW / origW, oldH / origH);
                        const newFormatScale = Math.min(newW / origW, newH / origH);
                        const incrementalScale = oldFormatScale > 0 ? (newFormatScale / oldFormatScale) : 1;
                        
                        if (isWrap) {
                            let userScale = parseFloat(el.dataset.userScale);
                            if (isNaN(userScale) || userScale <= 0) {
                                userScale = 1;
                                el.dataset.userScale = 1;
                            }
                            const newScale = userScale * newFormatScale;
                            el.dataset.scale = newScale;
                            const rot = el.dataset.rotation || 0;
                            el.style.transform = `rotate(${rot}deg) scale(${newScale})`;
                        } else {
                            if (el.style.width) el.style.width = (parseFloat(el.style.width) * incrementalScale) + 'px';
                            if (el.style.height) el.style.height = (parseFloat(el.style.height) * incrementalScale) + 'px';
                            if (el.style.fontSize) el.style.fontSize = (parseFloat(el.style.fontSize) * incrementalScale) + 'px';
                            if (el.style.padding) el.style.padding = (parseFloat(el.style.padding) * incrementalScale) + 'px';
                        }
                    }
                });
            }
        } catch (err) {
            console.error("Format transform error:", err);
        }
    }

    resizeCanvas();
    redrawAll();
    if(window.SaberEngine && typeof window.SaberEngine.resize === 'function') window.SaberEngine.resize(format.w, format.h);

    // Standart rozet/fiyat/detay katmanlarÃ„Â± yalnÃ„Â±zca 1920x1080'de gÃƒÂ¶ster
    var isBase = (format.w===1920 && format.h===1080);
    var hasStandardTemplate = (typeof activeLayout !== 'undefined' && activeLayout !== '');
    var vis = (hasStandardTemplate && !(typeof isCanvaMode !== 'undefined' && isCanvaMode)) ? '' : 'hidden';
    if(typeof elBadge !== 'undefined' && elBadge) elBadge.style.visibility = vis;
    if(typeof elPrice !== 'undefined' && elPrice) elPrice.style.visibility = vis;
    if(typeof elDetails !== 'undefined' && elDetails) elDetails.style.visibility = vis;
    if(typeof elLogo !== 'undefined' && elLogo) elLogo.style.visibility = vis;
    var _iL = document.getElementById('infoLineText');
    if(_iL) _iL.style.visibility = vis;

    // Format değiştiğinde ölçek çözünürlüklerini dinamik güncelle
    updateExportScaleDisplay();

    // Yükleme ekranını kapat
    setTimeout(() => {
        hideAppLoading(80);
    }, 200);
}

function updateExportScaleDisplay() {
    const scaleSelect = document.getElementById('exportScale');
    if (!scaleSelect) return;

    const formatSelect = document.getElementById('exportFormat') || document.getElementById('previewFormat');
    const formatName = formatSelect ? formatSelect.value : '16:9 Full HD';
    const format = (typeof EXPORT_FORMATS !== 'undefined' && EXPORT_FORMATS[formatName]) 
        ? EXPORT_FORMATS[formatName] 
        : { w: 1920, h: 1080 };

    const baseW = format.w || 1920;
    const baseH = format.h || 1080;

    const scaleConfig = [
        { val: '0.5', scale: 0.5, label: '0.5x' },
        { val: '0.75', scale: 0.75, label: '0.75x' },
        { val: '1', scale: 1.0, label: '1x' },
        { val: '1.5', scale: 1.5, label: '1.5x' },
        { val: '2', scale: 2.0, label: '2x' }
    ];

    const currentVal = scaleSelect.value || '1';
    const isProUser = (typeof APP_MODE !== 'undefined' && APP_MODE === 'pro');

    scaleSelect.innerHTML = '';
    scaleConfig.forEach(item => {
        const targetW = Math.round(baseW * item.scale);
        const targetH = Math.round(baseH * item.scale);
        const opt = document.createElement('option');
        opt.value = item.val;
        
        const isLocked = (!isProUser && item.scale > 1.0);
        opt.textContent = `${item.label} — ${targetW} × ${targetH} px${isLocked ? ' 🔒 Pro' : ''}`;
        if (isLocked) {
            opt.disabled = true;
        }
        if (item.val === currentVal) {
            opt.selected = true;
        }
        scaleSelect.appendChild(opt);
    });

    if (!isProUser && parseFloat(scaleSelect.value) > 1.0) {
        scaleSelect.value = '1';
    }

    const existingBadge = document.getElementById('exportResolutionBadge');
    if (existingBadge) existingBadge.remove();
}

window.updateExportScaleDisplay = updateExportScaleDisplay;

function buildExportFormats(){
    const sel1=$('exportFormat'),sel2=$('previewFormat');
    if(!sel1||!sel2)return;
    sel1.innerHTML='';
    sel2.innerHTML='';
    Object.keys(EXPORT_FORMATS).forEach(name=>{
        const f=EXPORT_FORMATS[name];
        const label=f.icon+' '+name+' — '+f.w+'x'+f.h;
        const opt1=document.createElement('option');
        opt1.value=name;
        opt1.textContent=label;
        sel1.appendChild(opt1);
        const opt2=document.createElement('option');
        opt2.value=name;
        opt2.textContent=label;
        sel2.appendChild(opt2);
    });
    updateExportScaleDisplay();
}


function drawMasterPhotoManually(ctx, el, masterImg, outputScale, canvasRect, actualElement = null) {
    if(!actualElement) actualElement = el; // Fallback
    const rect = actualElement.getBoundingClientRect();
    const x = (rect.left - canvasRect.left) * outputScale;
    const y = (rect.top - canvasRect.top) * outputScale;
    const w = rect.width * outputScale;
    const h = rect.height * outputScale;

    // Parse border-radius
    const style = window.getComputedStyle(actualElement);
    let br = style.borderRadius;
    let radius = 0;
    if (br && br.indexOf('px') !== -1) {
        radius = parseFloat(br) * outputScale;
    }

    ctx.save();
    ctx.beginPath();
    if (radius > 0) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
    } else {
        ctx.rect(x, y, w, h);
    }
    ctx.closePath();
    ctx.clip();

    let drawW, drawH, drawX, drawY;

    if (el.classList.contains('photo-inner-zoom')) {
        // Handle photo-zoom.js math
        const parent = actualElement;
        const s = parseFloat(parent.dataset.zpScale) || 1;
        const pX = parseFloat(parent.dataset.zpX) || 0;
        const pY = parseFloat(parent.dataset.zpY) || 0;
        
        let sX = 50, sY = 50;
        const xCtrl = document.getElementById('photoXCtrl');
        const yCtrl = document.getElementById('photoYCtrl');
        if (xCtrl) sX = parseFloat(xCtrl.value) || 50;
        if (yCtrl) sY = parseFloat(yCtrl.value) || 50;

        const natW = (parent && parent.dataset.naturalW) ? parseFloat(parent.dataset.naturalW) : (window.uploadedImgW || masterImg.naturalWidth || masterImg.width || 1920);
        const natH = (parent && parent.dataset.naturalH) ? parseFloat(parent.dataset.naturalH) : (window.uploadedImgH || masterImg.naturalHeight || masterImg.height || 1080);

        const imgRatio = natW / natH;
        const boxRatio = w / h;
        
        let coverW, coverH;
        if (imgRatio > boxRatio) {
            coverH = h;
            coverW = natW * (h / natH);
        } else {
            coverW = w;
            coverH = natH * (w / natW);
        }

        const offsetX_percent = (w - coverW) * (sX / 100);
        const offsetY_percent = (h - coverH) * (sY / 100);
        
        const unscaledX = x + offsetX_percent + (pX * outputScale);
        const unscaledY = y + offsetY_percent + (pY * outputScale);

        const cx = x + w/2;
        const cy = y + h/2;

        drawW = coverW * s;
        drawH = coverH * s;
        drawX = cx + (unscaledX - cx) * s;
        drawY = cy + (unscaledY - cy) * s;

    } else {
        let bgSize = el.style.backgroundSize;
        let bgPos = el.style.backgroundPosition;
        
        if (bgSize && bgSize.indexOf('px') !== -1 && bgPos && bgPos.indexOf('px') !== -1 && bgSize.indexOf('cover') === -1) {
            // Pixel based positioning (user dragged or zoomed)
            const sizeParts = bgSize.split(' ');
            const posParts = bgPos.split(' ');
            
            const cssW = parseFloat(sizeParts[0]);
            const cssH = parseFloat(sizeParts[1] || sizeParts[0]);
            const cssX = parseFloat(posParts[0]);
            const cssY = parseFloat(posParts[1] || posParts[0]);
            
            drawW = cssW * outputScale;
            drawH = cssH * outputScale;
            drawX = x + (cssX * outputScale);
            drawY = y + (cssY * outputScale);
        } else {
            // Fallback to "cover" but respect background-position percentages
            let sX = 50, sY = 50;
            let bgPosStr = el.style.backgroundPosition || '';
            let m = bgPosStr.match(/([\d.]+)%\s+([\d.]+)%/);
            if (m) {
                sX = parseFloat(m[1]);
                sY = parseFloat(m[2]);
            }

            const natW = (el && el.dataset.naturalW) ? parseFloat(el.dataset.naturalW) : (window.uploadedImgW || masterImg.naturalWidth || masterImg.width || 1920);
            const natH = (el && el.dataset.naturalH) ? parseFloat(el.dataset.naturalH) : (window.uploadedImgH || masterImg.naturalHeight || masterImg.height || 1080);

            const imgRatio = natW / natH;
            const boxRatio = w / h;
            
            if (imgRatio > boxRatio) {
                drawH = h;
                drawW = natW * (h / natH);
                drawX = x + (w - drawW) * (sX / 100);
                drawY = y;
            } else {
                drawW = w;
                drawH = natH * (w / natW);
                drawX = x;
                drawY = y + (h - drawH) * (sY / 100);
            }
        }
    }
    
        ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    let imageToDraw = masterImg;
    let isWebGLProcessed = false;

    // WebGL Donanım Hızlandırmalı Lightroom Motoru (Tam Çözünürlüklü 4K/8K GPU Çıktısı)
    if (window.WebGLPhotoEngine && window.WebGLPhotoEngine.initialized && typeof window.getWebGLPhotoOptions === 'function' && masterImg.width > 0) {
        try {
            const photoOpts = window.getWebGLPhotoOptions();
            // Export dosyasında kırmızı kılavuz maskesini kapat
            photoOpts.showMaskOverlay = false;
            imageToDraw = window.WebGLPhotoEngine.getProcessedCanvas(masterImg, photoOpts);
            isWebGLProcessed = true;
        } catch(e) {
            console.error('WebGL export fotoğraf işleme hatası: ', e);
            imageToDraw = masterImg;
            isWebGLProcessed = false;
        }
    } else if (window.applyPixelAdjustmentsToImageData && masterImg.width > 0) {
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = masterImg.width;
        tmpCanvas.height = masterImg.height;
        const tCtx = tmpCanvas.getContext('2d', {willReadFrequently:true});
        tCtx.drawImage(masterImg, 0, 0);
        
        try {
            const imgData = tCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
            const newImgData = tCtx.createImageData(tmpCanvas.width, tmpCanvas.height);
            if (window.applyPixelAdjustmentsToImageData(imgData.data, newImgData.data, tmpCanvas.width, tmpCanvas.height)) {
                tCtx.putImageData(newImgData, 0, 0);
                imageToDraw = tmpCanvas;
            }
        } catch(e) {
            console.error('Error applying high-res pixel adjustments: ', e);
        }
    }

    if (!isWebGLProcessed) {
        let computedFilter = window.getComputedStyle(actualElement).filter;
        if (computedFilter && computedFilter !== 'none') {
            computedFilter = computedFilter.replace(/drop-shadow\([^)]+\)/g, '').trim();
            if (computedFilter.length > 0) {
                ctx.filter = computedFilter;
            } else {
                ctx.filter = 'none';
            }
        }
    } else {
        ctx.filter = 'none';
    }
    
    ctx.drawImage(imageToDraw, drawX, drawY, drawW, drawH);
    ctx.filter = 'none'; // reset
    ctx.restore();
}

// ==========================================
// FONT VE VARLIK DOĞRULAMA (FONT READY SYNC)
// ==========================================
async function ensureFontsLoaded() {
    try {
        if (document.fonts && typeof document.fonts.ready !== 'undefined') {
            await document.fonts.ready;
        }
        // Tuvaldeki tüm yazı tiplerinin belleğe ve DOM'a oturması için kısa bir layout döngüsü
        await new Promise(r => requestAnimationFrame(() => setTimeout(r, 60)));
    } catch (err) {
        console.warn('Font loading wait warning:', err);
    }
}

// ==========================================
// ŞABLON ÇERÇEVELERİ SVG MASKE VE DEGRADE DIŞA AKTARMA KÖPRÜSÜ
// ==========================================
async function prepareTemplateFramesForExport() {
    const frames = document.querySelectorAll('.tb-frame-item, .tb-image-frame');
    const cleanups = [];
    for (const frame of frames) {
        const img = frame.querySelector('.tb-frame-img');
        if (!img || !img.complete || !img.naturalWidth) continue;

        const shape = frame.dataset.shape || 'none';
        const blend = frame.dataset.blendMode || 'none';
        const hasShape = (shape && shape !== 'none');
        const hasBlend = (blend && blend !== 'none');
        const isPolygon = (frame.dataset.isPolygon === 'true');
        const pitch = parseFloat(frame.dataset.pitch) || 0;
        const yaw = parseFloat(frame.dataset.yaw) || 0;
        const is3D = (pitch !== 0 || yaw !== 0);

        if (!hasShape && !hasBlend && !isPolygon && !is3D) continue;

        const frameW = frame.offsetWidth || 300;
        const frameH = frame.offsetHeight || 300;
        const supersample = 2;

        const exportCanvas = document.createElement('canvas');
        exportCanvas.className = 'tb-frame-export-canvas';
        exportCanvas.width = Math.round(frameW * supersample);
        exportCanvas.height = Math.round(frameH * supersample);
        exportCanvas.style.position = 'absolute';
        exportCanvas.style.left = '0';
        exportCanvas.style.top = '0';
        exportCanvas.style.width = '100%';
        exportCanvas.style.height = '100%';
        exportCanvas.style.pointerEvents = 'none';
        exportCanvas.style.zIndex = '2';

        const cCtx = exportCanvas.getContext('2d');
        if (!cCtx) continue;

        const zoom = parseFloat(frame.dataset.imgZoom) || 1.0;
        const panX = (parseFloat(frame.dataset.imgPanX) || 0) * supersample;
        const panY = (parseFloat(frame.dataset.imgPanY) || 0) * supersample;

        const natW = img.naturalWidth || frameW;
        const natH = img.naturalHeight || frameH;
        const coverScale = Math.max((frameW * supersample) / natW, (frameH * supersample) / natH) * zoom;
        const drawW = natW * coverScale;
        const drawH = natH * coverScale;
        const drawX = ((frameW * supersample) - drawW) / 2 + panX;
        const drawY = ((frameH * supersample) - drawH) / 2 + panY;

        cCtx.drawImage(img, drawX, drawY, drawW, drawH);

        // Serbest Çokgen Kırpması
        if (isPolygon && frame.dataset.polygonPoints) {
            try {
                const pts = JSON.parse(frame.dataset.polygonPoints);
                cCtx.save();
                cCtx.globalCompositeOperation = 'destination-in';
                cCtx.beginPath();
                pts.forEach((pt, idx) => {
                    const px = (parseFloat(pt.x) / 100) * exportCanvas.width;
                    const py = (parseFloat(pt.y) / 100) * exportCanvas.height;
                    if (idx === 0) cCtx.moveTo(px, py);
                    else cCtx.lineTo(px, py);
                });
                cCtx.closePath();
                cCtx.fillStyle = '#000000';
                cCtx.fill();
                cCtx.restore();
            } catch(e) {}
        }

        if (hasShape) {
            const clip = frame.querySelector('.tb-frame-clip') || frame;
            const comp = window.getComputedStyle(clip);
            const maskVal = comp.webkitMaskImage || comp.maskImage || '';
            const urlMatch = maskVal.match(/url\(["']?(data:image\/svg\+xml[^"']+)["']?\)/i);
            if (urlMatch && urlMatch[1]) {
                try {
                    const maskImg = new Image();
                    await new Promise((resolve) => {
                        maskImg.onload = resolve;
                        maskImg.onerror = resolve;
                        maskImg.src = urlMatch[1];
                    });
                    if (maskImg.complete && maskImg.naturalWidth > 0) {
                        cCtx.globalCompositeOperation = 'destination-in';
                        cCtx.drawImage(maskImg, 0, 0, exportCanvas.width, exportCanvas.height);
                        cCtx.globalCompositeOperation = 'source-over';
                    }
                } catch(e) {}
            }
        }

        if (hasBlend) {
            cCtx.globalCompositeOperation = 'destination-in';
            let grad = null;
            if (blend === 'fade-bottom') {
                grad = cCtx.createLinearGradient(0, 0, 0, exportCanvas.height);
                grad.addColorStop(0, 'rgba(0,0,0,1)');
                grad.addColorStop(0.55, 'rgba(0,0,0,0.85)');
                grad.addColorStop(1, 'rgba(0,0,0,0)');
            } else if (blend === 'fade-right') {
                grad = cCtx.createLinearGradient(0, 0, exportCanvas.width, 0);
                grad.addColorStop(0, 'rgba(0,0,0,1)');
                grad.addColorStop(0.55, 'rgba(0,0,0,0.85)');
                grad.addColorStop(1, 'rgba(0,0,0,0)');
            } else if (blend === 'fade-left') {
                grad = cCtx.createLinearGradient(exportCanvas.width, 0, 0, 0);
                grad.addColorStop(0, 'rgba(0,0,0,1)');
                grad.addColorStop(0.55, 'rgba(0,0,0,0.85)');
                grad.addColorStop(1, 'rgba(0,0,0,0)');
            }
            if (grad) {
                cCtx.fillStyle = grad;
                cCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
            }
            cCtx.globalCompositeOperation = 'source-over';
        }

        const clip = frame.querySelector('.tb-frame-clip') || frame;
        const inner = clip.querySelector('.tb-frame-inner') || clip;
        inner.appendChild(exportCanvas);
        const prevDisplay = img.style.display;
        img.style.display = 'none';

        cleanups.push(() => {
            exportCanvas.remove();
            img.style.display = prevDisplay;
        });

        // 3D Çerçeve Export Fırınlama (Three.js WebGL Offscreen)
        if (is3D && window.Template3DFrame && typeof window.Template3DFrame.render3DPlaneToCanvas === 'function') {
            try {
                const canvas3D = await window.Template3DFrame.render3DPlaneToCanvas(frame, supersample);
                if (canvas3D) {
                    canvas3D.className = 'tb-frame-export-3d-canvas';
                    canvas3D.style.position = 'absolute';
                    canvas3D.style.left = '50%';
                    canvas3D.style.top = '50%';
                    canvas3D.style.transform = 'translate(-50%, -50%)';
                    canvas3D.style.width = '150%';
                    canvas3D.style.height = '150%';
                    canvas3D.style.pointerEvents = 'none';
                    canvas3D.style.zIndex = '5';
                    const origTransform = frame.style.transform;
                    frame.style.transform = 'none';
                    frame.appendChild(canvas3D);
                    exportCanvas.style.display = 'none';

                    cleanups.push(() => {
                        canvas3D.remove();
                        frame.style.transform = origTransform;
                        exportCanvas.style.display = '';
                    });
                }
            } catch(e) {}
        }
    }
    return () => cleanups.forEach(fn => fn());
}

async function saveImage(customBaseName, options = {}){
    const rawFileType = options.fileType || (document.getElementById('exportFileType') ? document.getElementById('exportFileType').value : 'jpg');
    if (rawFileType === 'mp4' || rawFileType === 'video') {
        if (typeof window.exportAnimatedVideo === 'function') return window.exportAnimatedVideo(options);
        console.warn('Video export modülü henüz yüklenmedi.');
        return;
    }
    const isTransparent = (rawFileType === 'png_transparent');
    if (isTransparent) {
        window.isExportingTransparent = true;
    }
    showExportLoading('Tasarım İndiriliyor...', 'Tasarımınız yüksek çözünürlüklü olarak indirmeye hazırlanıyor...');
    
    // 1. Yazı tiplerinin (Google Fonts) belleğe tam oturmasını ve render edilmesini bekle
    await ensureFontsLoaded();
    // Pro / Demo Yetki ve Kilit Kontrolü
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

    let cleanupTemplateFrames = null;
    try {
        if (typeof prepareTemplateFramesForExport === 'function') {
            cleanupTemplateFrames = await prepareTemplateFramesForExport();
        }

        document.body.classList.add('is-exporting');
        
        // Şablon geçici gizlenmişse dışa aktarmada tam görünmesini sağla
        var _wasTplHidden = window.isTemplateHidden;
        if (_wasTplHidden && typeof window.toggleTemplateVisibility === 'function') {
            window.toggleTemplateVisibility(false);
        }

        if(typeof deselectAll === 'function') deselectAll();
        if(typeof _cerceveSecimKaldir === 'function') _cerceveSecimKaldir();
        if(typeof window._cerceveSecimKaldir === 'function') window._cerceveSecimKaldir();
        document.querySelectorAll('.el-selected').forEach(e=>e.classList.remove('el-selected'));
        document.querySelectorAll('.text-handle').forEach(h=>h.remove());
        document.querySelectorAll('.callout-controls, .callout-resizer, .callout-rotator, .callout-select-border, .callout-lock-btn, .cbtn-del, .callout-handle-width, .callout-handle-length, .draw-handle, .vertex-handle, .cerceve-handle, .kolaj-handle').forEach(c => c.style.display = 'none');
        const existingCtxMenu = document.getElementById('app-custom-context-menu');
        if (existingCtxMenu) existingCtxMenu.remove();
    
    // ZORUNLU PREPARE (SABLON VEYA LAYER ICIN)
    let needsPrep = false;
    document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => {
        if (!p.querySelector('.photo-render-canvas') && p.style.backgroundImage && p.style.backgroundImage !== 'none') {
            if (typeof _preparePhoto === 'function') {
                _preparePhoto(p);
                needsPrep = true;
            }
        }
    });
        document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => {
        if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p);
    });

    if (needsPrep) {
        // _applyPhotoTransform async calistigi icin image yuklenmesini biraz bekliyoruz.
        await new Promise(r => setTimeout(r, 150));
    }

    const wz=drawCanvas.style.zIndex,wp=drawCanvas.style.pointerEvents;
    drawCanvas.style.zIndex='7';
    drawCanvas.style.pointerEvents='none';
    
    const isForceOriginal = !!(options && options.forceOriginal);
    const formatName = isForceOriginal ? 'Orijinal Görsel Boyutu' : (exportFormat ? exportFormat.value : '16:9 Full HD');
    const isOriginal = isForceOriginal || (formatName === 'Orijinal Görsel Boyutu');
    const format = EXPORT_FORMATS[formatName] || {w:1920,h:1080};
    const fitMode = exportFitMode ? exportFitMode.value : 'cover';
    const bgColor = exportBgColor ? exportBgColor.value : '#ffffff';
    let outputScale = 1.5;
    const scaleVal1 = exportScale ? exportScale.value : '1.5';

    let safeMasterImage = (typeof uploadedImgUrl !== 'undefined' ? uploadedImgUrl : null) || (typeof masterImageBase64 !== 'undefined' ? masterImageBase64 : null);
    if (!safeMasterImage) {
        const pLayer = document.getElementById('photo-layer');
        if (pLayer && pLayer.style.backgroundImage && pLayer.style.backgroundImage !== 'none') {
            safeMasterImage = pLayer.style.backgroundImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
        } else {
            const innerZoom = document.querySelector('.photo-inner-zoom');
            if (innerZoom && innerZoom.style.backgroundImage && innerZoom.style.backgroundImage !== 'none') {
                safeMasterImage = innerZoom.style.backgroundImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
            }
        }
    }

    let masterImgObj = null;
    if (safeMasterImage) {
        masterImgObj = new Image();
        if (!safeMasterImage.startsWith('data:') && !safeMasterImage.startsWith('blob:')) { masterImgObj.crossOrigin = 'anonymous'; }
        await new Promise(r => { masterImgObj.onload = r; masterImgObj.onerror = r; masterImgObj.src = safeMasterImage; });
    }

    const currentW = parseInt(canvasEl.style.width) || 1920;
    const currentH = parseInt(canvasEl.style.height) || 1080;
    const canvasRatio = currentW / currentH;

    let targetW, targetH;

    if (isOriginal) {
        const natW = (typeof uploadedImgW !== 'undefined' && uploadedImgW > 0) ? uploadedImgW : (masterImgObj ? (masterImgObj.naturalWidth || masterImgObj.width) : currentW);
        const natH = (typeof uploadedImgH !== 'undefined' && uploadedImgH > 0) ? uploadedImgH : (masterImgObj ? (masterImgObj.naturalHeight || masterImgObj.height) : currentH);
        const natRatio = (natW && natH) ? (natW / natH) : canvasRatio;

        if (natW && natH && Math.abs(canvasRatio - natRatio) < 0.05 && natW >= currentW && natH >= currentH) {
            // Tuval ve fotoğraf aynı orandaysa tam fotoğraf çözünürlüğünde dışa aktar!
            targetW = Math.round(natW);
            targetH = Math.round(natH);
            outputScale = targetW / currentW;
        } else {
            // Tuval en-boy oranını %100 koruyarak seçili ölçekte aktar
            const baseScale = (scaleVal1 === 'original') ? 1 : (parseFloat(scaleVal1) || 1.5);
            outputScale = Math.max(1, baseScale);
            targetW = Math.round(currentW * outputScale);
            targetH = Math.round(currentH * outputScale);
        }
    } else {
        if (scaleVal1 === 'original' && safeMasterImage) {
            outputScale = 1; 
        } else {
            outputScale = parseFloat(scaleVal1) || 1.5;
        }
        if (scaleVal1 === 'original' && masterImgObj && masterImgObj.width > 0) {
            outputScale = Math.min(masterImgObj.width / currentW, masterImgObj.height / currentH);
        }
        targetW = Math.round(format.w * outputScale);
        targetH = Math.round(format.h * outputScale);
    }
    
    if (typeof window.isMobileDevice === 'function' && window.isMobileDevice()) {
        const maxMobileScale = 2.5;
        if (outputScale > maxMobileScale) {
            console.warn('Mobile memory lock active: Reduced export scale from ' + outputScale + ' to ' + maxMobileScale);
            outputScale = maxMobileScale;
        }
    }

    const targetWFinal = targetW;
    const targetHFinal = targetH;
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetW;
    finalCanvas.height = targetH;
    const ctx = finalCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Sablonlu Mod kontrolu (Canva, Kolaj veya Klasik Şablonlar)
    const cvrBase = document.querySelector('.cvr-base');
    const hasKolaj = !!document.getElementById('kolaj-wrapper');
    const isTemplateMode = !!cvrBase || !!document.querySelector('.photo-panel') || hasKolaj;

    if (isTemplateMode) {
        // ==========================================
        // SABLONLU MOD
        // ==========================================
        
        // ==========================================
        // SABLONLU MOD - 3 KATMANLI (SANDWICH) RENDER
        // ==========================================
        
        canvasEl.style.transition='none';
        canvasEl.style.transform='none';
        
        const overlay = document.createElement('div');
        overlay.id = 'download-overlay-mask';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'transparent';
        overlay.style.zIndex = '9999990';
        overlay.style.pointerEvents = 'none';
        document.body.appendChild(overlay);

        const oldPosition = canvasEl.style.position;
        const oldLeft = canvasEl.style.left;
        const oldTop = canvasEl.style.top;
        const oldMargin = canvasEl.style.margin;
        const oldZIndex = canvasEl.style.zIndex;

        canvasEl.style.position = 'fixed';
        canvasEl.style.left = '0px';
        canvasEl.style.top = '0px';
        canvasEl.style.margin = '0px';
        canvasEl.style.zIndex = '9999998';

        try {
            // 1. Çizimlerin kaymasını ve bulanık çıkmasını önlemek için PixiJS motorunu Yüksek Çözünürlüğe hazırla
            if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
                const saberApp = window.SaberEngine.getApp();
                if (saberApp && saberApp.view && saberApp.renderer && saberApp.stage) {
                    saberApp.renderer.resize(targetW, targetH);
                    saberApp.stage.scale.set(outputScale);
                    saberApp.renderer.render(saberApp.stage);
                    // html2canvas'ın doğru yakalaması için CSS boyutlarını ana ekranla aynı tutuyoruz (iç çözünürlük 4K kalıyor)
                    saberApp.view.style.width = currentW + 'px';
                    saberApp.view.style.height = currentH + 'px';
                }
            }

            // 2. --- SINGLE PASS RENDER V2 ---
            // ÇİFT FİLTRE (DOUBLE-FILTER) ÖNLEMİ:
            // Sadece export işlemi sırasında filtrenin fiziksel canvasa çizilmesi için bayrak:
            window.isExportingNow = true;
            window.exportingScale = outputScale;

            // Sistem '.photo-render-canvas' içine zaten donanım seviyesinde filtreleri bastığı için,
            // HTML2Canvas'ın '.photo-panel' üzerindeki CSS filtrelerini tekrar uygulamasını engelliyoruz.
            const filterPanels = document.querySelectorAll('.photo-panel, #photo-layer');
            const savedFilters = new Map();
            filterPanels.forEach(p => {
                savedFilters.set(p, p.style.filter);
                if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p); // Filtreyi fiziksel canvasa bas (okuyabilmesi için ÖNCE çalışmalı)
                p.style.filter = 'none'; // HTML2Canvas çift göstermesin diye SONRA sıfırla
            });

            let reqScaleX = targetW / currentW;
            let reqScaleY = targetH / currentH;
            let supersamplingScale = Math.max(outputScale, (window.devicePixelRatio || 3), reqScaleX, reqScaleY);
            const MAX_DIM = 5000;
            if (currentW * supersamplingScale > MAX_DIM) supersamplingScale = MAX_DIM / currentW;
            if (currentH * supersamplingScale > MAX_DIM) supersamplingScale = MAX_DIM / currentH;
            if ((currentW * currentH * supersamplingScale * supersamplingScale) > 16000000) supersamplingScale = Math.sqrt(16000000 / (currentW * currentH));
            supersamplingScale = Math.floor(supersamplingScale * 10) / 10;
            const finalHtml2Canvas = await html2canvas(canvasEl, {
                width: currentW,
                height: currentH,
                scale: supersamplingScale,
                useCORS: true,
                allowTaint: false,
                imageTimeout: 0,
                
                logging: false,
                backgroundColor: (!isTransparent && bgColor && bgColor !== 'transparent') ? bgColor : null,
                ignoreElements: (el) => isExportIgnoredElement(el),
                onclone: (clonedDoc) => sanitizeExportClone(clonedDoc)
            });
            ctx.drawImage(finalHtml2Canvas, 0, 0, targetW, targetH);

            // Çizimleri ve dolguları export canvasına bas
            if (typeof window.redrawAllToContext === 'function') {
                const hasSaberActive = !!(window.SaberEngine && typeof window.SaberEngine.getApp === 'function');
                window.redrawAllToContext(ctx, outputScale, { skipNeonStrokes: hasSaberActive });
            }

            // 3D WebGL Katmanını ve PixiJS Saber katmanını gerçek z-index derinlik sırasına göre bas
            draw3DAndSaberToContext(ctx, targetW, targetH, outputScale, currentW, currentH);
            
            // Filtreleri eski haline döndür
            window.isExportingNow = false;
            window.exportingScale = null;
            filterPanels.forEach(p => {
                p.style.filter = savedFilters.get(p) || '';
                if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p); // Tekrar preview çözünürlüğünde ve filtresiz fiziksel canvas olarak geri yükle
            });

        } catch (e) {
            console.error("Single Pass V2 Render Error:", e);
        }
        
        window.isExportingNow = false;

        canvasEl.style.position = oldPosition;
        canvasEl.style.left = oldLeft;
        canvasEl.style.top = oldTop;
        canvasEl.style.margin = oldMargin;
        canvasEl.style.zIndex = oldZIndex;
        document.body.removeChild(overlay);
        if (typeof resizeCanvas === 'function') resizeCanvas();

        // --- UI RESTORE ---
        document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => { if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p); });
        
    } else {
        // ==========================================
        // SABLONSUZ MOD
        // ==========================================
        
        // Fill the background color of the canvas first (so it's exported)
        let customBg = window.getComputedStyle(canvasEl).backgroundColor;
        if (!isTransparent && customBg && customBg !== 'rgba(0, 0, 0, 0)' && customBg !== 'transparent') {
            ctx.fillStyle = customBg;
            ctx.fillRect(0, 0, targetW, targetH);
        }
        
        // 1. Fallback fotograf ciz (şeffaf modda atla)
        if (!isTransparent && masterImgObj && masterImgObj.width > 0) {
            const panel = document.getElementById('photo-layer');
            if (panel) {
            const w = targetW;
            const h = targetH;
            
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, w, h);
            ctx.clip();
            const style = window.getComputedStyle(panel);
            let filter = style.filter;
            if (filter && filter !== 'none') {
                filter = filter.replace(/drop-shadow\([^)]+\)/g, '').trim();
                if (filter !== '') ctx.filter = filter;
            }
            
            const renderCanvas = panel.querySelector('.photo-render-canvas');
            if (renderCanvas && renderCanvas.width > 0) {
                ctx.drawImage(renderCanvas, 0, 0, w, h);
            } else {
                const natW = (panel && panel.dataset.naturalW) ? parseFloat(panel.dataset.naturalW) : (window.uploadedImgW || masterImgObj.naturalWidth || masterImgObj.width || 1920);
                const natH = (panel && panel.dataset.naturalH) ? parseFloat(panel.dataset.naturalH) : (window.uploadedImgH || masterImgObj.naturalHeight || masterImgObj.height || 1080);
                const fitMode = window.photoFitMode || 'cover';
                if (fitMode === 'contain') {
                    const ratio = Math.min(w / natW, h / natH);
                    const dw = natW * ratio;
                    const dh = natH * ratio;
                    const dx = (w - dw) / 2;
                    const dy = (h - dh) / 2;
                    ctx.drawImage(masterImgObj, dx, dy, dw, dh);
                } else {
                    const imgRatio = natW / natH;
                    const panelRatio = w / h;
                    let dw = w;
                    let dh = h;
                    let dx = 0;
                    let dy = 0;
                    if (imgRatio > panelRatio) {
                        dw = h * imgRatio;
                        dx = (w - dw) / 2;
                    } else {
                        dh = w / imgRatio;
                        dy = (h - dh) / 2;
                    }
                    ctx.drawImage(masterImgObj, dx, dy, dw, dh);
                }
            }
            ctx.filter = 'none';
            ctx.restore();
        }
        } // Close the masterImgObj condition

        // Çizimleri ve dolguları export canvasına bas (html2canvas öncesi z-index uyumu)
        if (typeof window.redrawAllToContext === 'function') {
            const hasSaberActive = !!(window.SaberEngine && typeof window.SaberEngine.getApp === 'function');
            window.redrawAllToContext(ctx, outputScale, { skipNeonStrokes: hasSaberActive });
        }

        // 2. İçerik Katmanlarını (2D DOM, 3D WebGL ve PixiJS Saber) gerçek z-index derinlik sırasına göre bas
        const overlay = document.createElement('div');
        overlay.id = 'download-overlay-mask';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'transparent';
        overlay.style.zIndex = '9999990';
        overlay.style.pointerEvents = 'none';
        document.body.appendChild(overlay);

        const oldPosition = canvasEl.style.position;
        const oldLeft = canvasEl.style.left;
        const oldTop = canvasEl.style.top;
        const oldMargin = canvasEl.style.margin;
        const oldZIndex = canvasEl.style.zIndex;
        const oldBg = canvasEl.style.backgroundColor;
        const oldTransform = canvasEl.style.transform;
        const oldTransition = canvasEl.style.transition;

        canvasEl.style.position = 'fixed';
        canvasEl.style.left = '0px';
        canvasEl.style.top = '0px';
        canvasEl.style.margin = '0px';
        canvasEl.style.zIndex = '9999998';
        canvasEl.style.setProperty('background-color', 'transparent', 'important');
        canvasEl.style.transform = 'none';
        canvasEl.style.transition = 'none';

        try {
            let reqScaleX = targetW / currentW;
            let reqScaleY = targetH / currentH;
            let supersamplingScale = Math.max(outputScale, (window.devicePixelRatio || 3), reqScaleX, reqScaleY);
            const MAX_DIM = 5000;
            if (currentW * supersamplingScale > MAX_DIM) supersamplingScale = MAX_DIM / currentW;
            if (currentH * supersamplingScale > MAX_DIM) supersamplingScale = MAX_DIM / currentH;
            if ((currentW * currentH * supersamplingScale * supersamplingScale) > 16000000) supersamplingScale = Math.sqrt(16000000 / (currentW * currentH));
            supersamplingScale = Math.floor(supersamplingScale * 10) / 10;

            await compositeContentLayersInZOrder({
                targetCtx: ctx,
                canvasEl,
                targetW,
                targetH,
                outputScale,
                currentW,
                currentH,
                supersamplingScale,
                isTransparent: !!isTransparent,
                bgColor: null,
                isTemplateMode: false
            });
        } catch (e) {
            console.error("Non-template Composite Render Error:", e);
        }

        canvasEl.style.position = oldPosition;
        canvasEl.style.left = oldLeft;
        canvasEl.style.top = oldTop;
        canvasEl.style.margin = oldMargin;
        canvasEl.style.zIndex = oldZIndex;
        if(oldBg) { canvasEl.style.setProperty('background-color', oldBg, 'important'); } else { canvasEl.style.removeProperty('background-color'); }
        canvasEl.style.transform = oldTransform;
        canvasEl.style.transition = oldTransition;
        document.body.removeChild(overlay);
        resizeCanvas();

        // --- UI RESTORE ---
        document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => { if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p); });
    }

        drawCanvas.style.zIndex=wz;
        drawCanvas.style.pointerEvents=wp;

        // DEMO FILIGRAN / WATERMARK
        if (typeof window.addWatermark === 'function') {
            await window.addWatermark(finalCanvas);
        }

        // INDIRME
        const a = document.createElement('a');
        const fmtSafe = formatName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const basePrefix = (customBaseName && typeof customBaseName === 'string') ? customBaseName : 'emlak-studiom';
        if (rawFileType === 'jpg') {
            a.download = basePrefix + '-' + fmtSafe + '-' + targetW + 'x' + targetH + '.jpg';
            a.href = finalCanvas.toDataURL('image/jpeg', 1.0);
        } else if (rawFileType === 'png_transparent') {
            a.download = basePrefix + '-' + fmtSafe + '-' + targetW + 'x' + targetH + '-seffaf.png';
            a.href = finalCanvas.toDataURL('image/png');
        } else {
            a.download = basePrefix + '-' + fmtSafe + '-' + targetW + 'x' + targetH + '.png';
            a.href = finalCanvas.toDataURL('image/png');
        }
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch(err) {
        console.error("SaveImage Error:", err);
        alert("Dışa aktarma sırasında bir hata oluştu: " + (err.message || err));
    } finally {
        if (typeof cleanupTemplateFrames === 'function') {
            try { cleanupTemplateFrames(); } catch(e){}
        }
        window.isExportingTransparent = false;
        if (typeof _wasTplHidden !== 'undefined' && _wasTplHidden && typeof window.toggleTemplateVisibility === 'function') {
            window.toggleTemplateVisibility(true);
        }
        if (typeof resizeCanvas === 'function') resizeCanvas();
        window.isExportingNow = false;
        document.body.classList.remove('is-exporting');
        // Tuvalin yerine tam oturup ekranın boyanması için yükleme ekranını tuval hazır olunca kapatıyoruz
        setTimeout(() => {
            hideAppLoading(0, true);
        }, 350);
    }
}

window.exportTransparentPNG = function(customBaseName) {
    return saveImage(customBaseName, { fileType: 'png_transparent' });
};

// ══════════════════════════════════════════════
// 🎬 CANLI ANİMASYONLU VİDEO MOTORU
// Bu bölüm bağımsız modül mimarisi gereğince modules/export-video.js dosyasına taşınmıştır.
// ══════════════════════════════════════════════

function renderBatchList(){
    const l=$('batchFileList');
    if (!l) return;
    l.innerHTML='';

    // Eğer PhotoStagingArchive havuzunda görseller varsa öncelikli olarak onları listele
    let files = [];
    if (window.PhotoStagingArchive && window.PhotoStagingArchive.items && window.PhotoStagingArchive.items.length > 0) {
        files = window.PhotoStagingArchive.items.map((it, i) => ({
            name: (it.title || ('foto_' + (i + 1))) + '.png',
            size: it.dataUrl ? Math.round(it.dataUrl.length * 0.75) : 102400,
            thumbUrl: it.thumbUrl || it.dataUrl
        }));
    } else if (typeof batchFiles !== 'undefined' && batchFiles && batchFiles.length) {
        files = batchFiles;
    }

    if (!files || !files.length) {
        l.style.display = 'none';
        return;
    }
    l.style.display = 'block';
    files.forEach((f,i)=>{
        const d=document.createElement('div');
        d.className='batch-file-item';
        const thumbHtml = f.thumbUrl ? `<img src="${f.thumbUrl}" style="width:24px; height:24px; object-fit:cover; border-radius:4px; margin-right:8px; vertical-align:middle; border:1px solid #cbd5e1;">` : '';
        d.innerHTML='<span style="display:flex; align-items:center; min-width:0; overflow:hidden; text-overflow:ellipsis;">'+thumbHtml+(i+1)+'. '+f.name+'</span><span style="flex-shrink:0; font-size:10px; color:#94a3b8;">'+(f.size/1024).toFixed(0)+'KB</span>';
        l.appendChild(d);
    });
}

function clearBatchFiles(){
    if (window.PhotoStagingArchive && window.PhotoStagingArchive.items && window.PhotoStagingArchive.items.length > 0) {
        window.PhotoStagingArchive.clearAllPool();
    } else {
        batchFiles=[];
        const inp = $('batchInput');
        if (inp) inp.value='';
        const l = $('batchFileList');
        if (l) { l.innerHTML=''; l.style.display='none'; }
        const p = $('batchProgress');
        if (p) p.style.display='none';
    }
}

async function startBatchExport(options){
    let activeBatchFiles = (options && options.files && options.files.length) ? options.files : null;
    if (!activeBatchFiles || !activeBatchFiles.length) {
        if (typeof batchFiles !== 'undefined' && batchFiles && batchFiles.length) {
            activeBatchFiles = batchFiles;
        } else if (window.PhotoStagingArchive && window.PhotoStagingArchive.items && window.PhotoStagingArchive.items.length > 0) {
            activeBatchFiles = window.PhotoStagingArchive.items.map((it, i) => ({
                name: (it.title || ('foto_' + (i + 1))) + '.png',
                dataUrl: it.dataUrl
            }));
        } else {
            activeBatchFiles = window.batchFiles || [];
        }
    }
    if(!activeBatchFiles || !activeBatchFiles.length){
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'info',
                title: 'Fotoğraf Bulunamadı',
                text: 'Lütfen önce Görseller veya Giriş sekmesinden indirmek istediğiniz fotoğrafları ekleyin.',
                background: '#1e293b',
                color: '#fff'
            });
        } else {
            alert('Lütfen önce fotoğraf ekleyin!');
        }
        return;
    }

    // Pro / Demo Yetki ve Kilit Kontrolü
    if (typeof window.validateExportAllowed === 'function') {
        const check = window.validateExportAllowed();
        if (!check.allowed) {
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

    await ensureFontsLoaded();


    var _wasTplHiddenBatch = window.isTemplateHidden;
    if (_wasTplHiddenBatch && typeof window.toggleTemplateVisibility === 'function') {
        window.toggleTemplateVisibility(false);
    }
    
    batchProgress.style.display='block';
    if(drawMode!=='off')setDrawMode('off');
    
    document.body.classList.add('is-exporting');
    if(typeof deselectAll === 'function') deselectAll();
    document.querySelectorAll('.el-selected').forEach(e=>e.classList.remove('el-selected'));
    document.querySelectorAll('.text-handle').forEach(h=>h.remove());
    document.querySelectorAll('.callout-controls, .callout-resizer, .callout-rotator, .callout-select-border, .callout-lock-btn, .cbtn-del, .callout-handle-width, .callout-handle-length, .draw-handle, .vertex-handle').forEach(c => c.style.display = 'none');
    const existingBatchCtx = document.getElementById('app-custom-context-menu');
    if (existingBatchCtx) existingBatchCtx.remove();
    
    const wz=drawCanvas.style.zIndex,wp=drawCanvas.style.pointerEvents;
    drawCanvas.style.zIndex='7';
    drawCanvas.style.pointerEvents='none';
    
    const formatName=exportFormat?exportFormat.value:'16:9 Full HD';
    const format=EXPORT_FORMATS[formatName]||{w:1920,h:1080};
    const fitMode=exportFitMode?exportFitMode.value:'cover';
    const bgColor=exportBgColor?exportBgColor.value:'#ffffff';
    const scaleVal1 = exportScale?exportScale.value:'1.5';
    const rawBatchFileType = document.getElementById('exportFileType') ? document.getElementById('exportFileType').value : 'jpg';
    const isBatchTransparent = (rawBatchFileType === 'png_transparent');
    if (isBatchTransparent) {
        window.isExportingTransparent = true;
    }
    const currentW=parseInt(canvasEl.style.width)||1920;
    const currentH=parseInt(canvasEl.style.height)||1080;

    const startIndex = (options && typeof options.startIndex === 'number') ? options.startIndex : 0;
    const selectedPresetId = (options && options.presetId) ? options.presetId : (document.getElementById('batchPresetSelect') ? document.getElementById('batchPresetSelect').value : 'current');
    const prefixInput = document.getElementById('batchPrefixInput') ? document.getElementById('batchPrefixInput').value.trim() : '';

    try {
        if (selectedPresetId && selectedPresetId !== 'current') {
            if (window.CustomPresetsManager) {
                window.CustomPresetsManager.applyPreset(selectedPresetId);
            } else if (typeof applyPreset === 'function') {
                applyPreset(selectedPresetId);
            }
        }

        for(let i = startIndex; i < activeBatchFiles.length; i++){
        const rawBaseName = activeBatchFiles[i].name.replace(/\.[^/.]+$/, "");
        const batchName = (prefixInput ? prefixInput : '') + rawBaseName;

        batchStatus.textContent=activeBatchFiles[i].name;
        batchPercent.textContent=Math.round(((i + 1) / activeBatchFiles.length) * 100)+'%';
        batchBar.style.width=Math.round(((i + 1) / activeBatchFiles.length) * 100)+'%';
        
        const url=await readFileUrl(activeBatchFiles[i]);
        if(typeof uploadedImgUrl !== 'undefined') uploadedImgUrl=url; 
        if(typeof trackImageSize==='function') trackImageSize(url);
        
        const pLayer = document.getElementById('photo-layer');
        if (pLayer) pLayer.style.backgroundImage="url('"+url+"')";
        
        if(typeof isCanvaMode !== 'undefined' && isCanvaMode && typeof refreshActiveCanvaTemplate === 'function') refreshActiveCanvaTemplate();
        else if(typeof isCanvaMode !== 'undefined' && isCanvaMode) buildCanvaRender();
        
        // Gorsel panele yerlestirildikten sonra hazirla
        let needsPrep = false;
        document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => {
            if (!p.querySelector('.photo-render-canvas') && p.style.backgroundImage && p.style.backgroundImage !== 'none') {
                if (typeof _preparePhoto === 'function') {
                    _preparePhoto(p);
                    needsPrep = true;
                }
            }
        });
        
        // Her iterasyonda photo-render-canvas'i yeniden cizmeye zorluyoruz (cunku arkaplan degisti)
        document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => {
            if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p);
        });
        
        await new Promise(r => setTimeout(r, 200));

        let masterImgObj = new Image();
        masterImgObj.crossOrigin = 'anonymous';
        await new Promise(r => { masterImgObj.onload = r; masterImgObj.onerror = r; masterImgObj.src = url; });

        let outputScale = 1.5;
        if (scaleVal1 === 'original') {
            if (masterImgObj.width > 0) {
                outputScale = Math.min(masterImgObj.width / currentW, masterImgObj.height / currentH);
            } else {
                outputScale = 1;
            }
        } else {
            outputScale = parseFloat(scaleVal1) || 1.5;
        }
        
        if (typeof window.isMobileDevice === 'function' && window.isMobileDevice()) {
            const maxMobileScale = 2.5;
            if (outputScale > maxMobileScale) {
                outputScale = maxMobileScale;
            }
        }

        const targetW = Math.round(format.w * outputScale);
        const targetH = Math.round(format.h * outputScale);
        let finalCanvas = document.createElement('canvas');
        finalCanvas.width = targetW;
        finalCanvas.height = targetH;
        let ctx = finalCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const cvrBase = document.querySelector('.cvr-base');
        const hasKolaj = !!document.getElementById('kolaj-wrapper');
        const isTemplateMode = !!cvrBase || !!document.querySelector('.photo-panel') || hasKolaj;

        if (isTemplateMode) {
            // ==========================================
              // SABLONLU MOD - 3 KATMANLI (SANDWICH) RENDER
              // ==========================================
              
              canvasEl.style.transition='none';
              canvasEl.style.transform='none';
              
              const overlay = document.createElement('div');
              overlay.id = 'download-overlay-mask';
              overlay.style.position = 'fixed';
              overlay.style.top = '0';
              overlay.style.left = '0';
              overlay.style.width = '100vw';
              overlay.style.height = '100vh';
              overlay.style.backgroundColor = 'transparent';
              overlay.style.zIndex = '9999990';
              overlay.style.pointerEvents = 'none';
              document.body.appendChild(overlay);

              const oldPosition = canvasEl.style.position;
              const oldLeft = canvasEl.style.left;
              const oldTop = canvasEl.style.top;
              const oldMargin = canvasEl.style.margin;
              const oldZIndex = canvasEl.style.zIndex;

              canvasEl.style.position = 'fixed';
              canvasEl.style.left = '0px';
              canvasEl.style.top = '0px';
              canvasEl.style.margin = '0px';
              canvasEl.style.zIndex = '9999998';

              try {
                  // --- SINGLE PASS RENDER ---
                    let reqScaleX = targetW / currentW;
                    let reqScaleY = targetH / currentH;
                    let supersamplingScale = Math.max(outputScale, (window.devicePixelRatio || 3), reqScaleX, reqScaleY);
                    const MAX_DIM = 5000;
                    if (currentW * supersamplingScale > MAX_DIM) supersamplingScale = MAX_DIM / currentW;
                    if (currentH * supersamplingScale > MAX_DIM) supersamplingScale = MAX_DIM / currentH;
                    if ((currentW * currentH * supersamplingScale * supersamplingScale) > 16000000) supersamplingScale = Math.sqrt(16000000 / (currentW * currentH));
                    supersamplingScale = Math.floor(supersamplingScale * 10) / 10;
                    const finalHtml2Canvas = await html2canvas(canvasEl, {
                        width: currentW,
                        height: currentH,
                        scale: supersamplingScale,
                        useCORS: true,
                        allowTaint: false,
                        imageTimeout: 0,
                        logging: false,
                        backgroundColor: null,
                        ignoreElements: (el) => isExportIgnoredElement(el),
                        onclone: (clonedDoc) => sanitizeExportClone(clonedDoc)
                    });
                    ctx.drawImage(finalHtml2Canvas, 0, 0, targetW, targetH);
                  
                  

              } catch (e) {
                  console.error("Sandwich Render Error:", e);
              }

              canvasEl.style.position = oldPosition;
              canvasEl.style.left = oldLeft;
              canvasEl.style.top = oldTop;
              canvasEl.style.margin = oldMargin;
              canvasEl.style.zIndex = oldZIndex;
              document.body.removeChild(overlay);
            resizeCanvas();
        // --- UI RESTORE ---
        document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => { if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p); });

        // Çizimleri ve dolguları export canvasına bas
        if (typeof window.redrawAllToContext === 'function') {
            const hasSaberActive = !!(window.SaberEngine && typeof window.SaberEngine.getApp === 'function');
            window.redrawAllToContext(ctx, outputScale, { skipNeonStrokes: hasSaberActive });
        }

        // 3D WebGL Katmanını ve PixiJS Saber katmanını gerçek z-index derinlik sırasına göre bas
        draw3DAndSaberToContext(ctx, targetW, targetH, outputScale, currentW, currentH);
        } else {
            // SABLONSUZ MOD
            let customBg = window.getComputedStyle(canvasEl).backgroundColor;
            if (!isBatchTransparent && customBg && customBg !== 'rgba(0, 0, 0, 0)' && customBg !== 'transparent') {
                ctx.fillStyle = customBg;
                ctx.fillRect(0, 0, targetW, targetH);
            }

            if (!isBatchTransparent && masterImgObj && masterImgObj.width > 0) {
                const panel = document.getElementById('photo-layer');
            if (panel) {
                const w = targetW;
                const h = targetH;
                
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, 0, w, h);
                ctx.clip();
                
                // Faz 3: CSS Filter Korunmasi
                const style = window.getComputedStyle(panel);
                let filter = style.filter;
                if (filter && filter !== 'none') {
                    filter = filter.replace(/drop-shadow\([^)]+\)/g, '').trim();
                    if (filter !== '') ctx.filter = filter;
                }

                const renderCanvas = panel.querySelector('.photo-render-canvas');
                if (renderCanvas && renderCanvas.width > 0) {
                    ctx.drawImage(renderCanvas, 0, 0, w, h);
                } else {
                    const natW = (panel && panel.dataset.naturalW) ? parseFloat(panel.dataset.naturalW) : (window.uploadedImgW || masterImgObj.naturalWidth || masterImgObj.width || 1920);
                    const natH = (panel && panel.dataset.naturalH) ? parseFloat(panel.dataset.naturalH) : (window.uploadedImgH || masterImgObj.naturalHeight || masterImgObj.height || 1080);
                    if (fitMode === 'contain') {
                        const ratio = Math.min(w / natW, h / natH);
                        const dw = natW * ratio;
                        const dh = natH * ratio;
                        const dx = (w - dw) / 2;
                        const dy = (h - dh) / 2;
                        ctx.drawImage(masterImgObj, dx, dy, dw, dh);
                    } else {
                        const imgRatio = natW / natH;
                        const panelRatio = w / h;
                        let dw = w;
                        let dh = h;
                        let dx = 0;
                        let dy = 0;
                        if (imgRatio > panelRatio) {
                            dw = h * imgRatio;
                            dx = (w - dw) / 2;
                        } else {
                            dh = w / imgRatio;
                            dy = (h - dh) / 2;
                        }
                        ctx.drawImage(masterImgObj, dx, dy, dw, dh);
                    }
                }
                ctx.filter = 'none'; // Sifirla
                ctx.restore();
            }
            } // Close masterImgObj condition

            // Çizimleri ve dolguları export canvasına bas (html2canvas öncesi z-index uyumu)
            if (typeof window.redrawAllToContext === 'function') {
                const hasSaberActive = !!(window.SaberEngine && typeof window.SaberEngine.getApp === 'function');
                window.redrawAllToContext(ctx, outputScale, { skipNeonStrokes: hasSaberActive });
            }

            // 2. İçerik Katmanlarını (2D DOM, 3D WebGL ve PixiJS Saber) gerçek z-index derinlik sırasına göre bas
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.backgroundColor = '#0f172a';
            overlay.style.zIndex = '9999999';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            document.body.appendChild(overlay);

            const oldPosition = canvasEl.style.position;
            const oldLeft = canvasEl.style.left;
            const oldTop = canvasEl.style.top;
            const oldMargin = canvasEl.style.margin;
            const oldZIndex = canvasEl.style.zIndex;
            const oldBg = canvasEl.style.backgroundColor;
            const oldTransform = canvasEl.style.transform;
            const oldTransition = canvasEl.style.transition;

            canvasEl.style.position = 'fixed';
            canvasEl.style.left = '0px';
            canvasEl.style.top = '0px';
            canvasEl.style.margin = '0px';
            canvasEl.style.zIndex = '9999998';
            canvasEl.style.setProperty('background-color', 'transparent', 'important');
            canvasEl.style.transform = 'none';
            canvasEl.style.transition = 'none';

            try {
                let reqScaleX = targetW / currentW;
                let reqScaleY = targetH / currentH;
                let supersamplingScale = Math.max(outputScale, (window.devicePixelRatio || 3), reqScaleX, reqScaleY);
                const MAX_DIM = 5000;
                if (currentW * supersamplingScale > MAX_DIM) supersamplingScale = MAX_DIM / currentW;
                if (currentH * supersamplingScale > MAX_DIM) supersamplingScale = MAX_DIM / currentH;
                if ((currentW * currentH * supersamplingScale * supersamplingScale) > 16000000) supersamplingScale = Math.sqrt(16000000 / (currentW * currentH));
                supersamplingScale = Math.floor(supersamplingScale * 10) / 10;

                await compositeContentLayersInZOrder({
                    targetCtx: ctx,
                    canvasEl,
                    targetW,
                    targetH,
                    outputScale,
                    currentW,
                    currentH,
                    supersamplingScale,
                    isTransparent: !!isBatchTransparent,
                    bgColor: null,
                    isTemplateMode: false
                });
            } catch (e) {
                console.error("Non-template Batch Composite Render Error:", e);
            }

            canvasEl.style.position = oldPosition;
            canvasEl.style.left = oldLeft;
            canvasEl.style.top = oldTop;
            canvasEl.style.margin = oldMargin;
            canvasEl.style.zIndex = oldZIndex;
            if(oldBg) { canvasEl.style.setProperty('background-color', oldBg, 'important'); } else { canvasEl.style.removeProperty('background-color'); }
            canvasEl.style.transform = oldTransform;
            canvasEl.style.transition = oldTransition;
            document.body.removeChild(overlay);
            resizeCanvas();

            // --- UI RESTORE ---
            document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => { if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p); });
        }

        // DEMO FILIGRAN / WATERMARK
        if (typeof window.addWatermark === 'function') {
            await window.addWatermark(finalCanvas);
        }

        // INDIRME
        const a = document.createElement('a');
        const fmtSafe = formatName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        if (rawBatchFileType === 'jpg') {
            a.download = batchName + '-' + fmtSafe + '-' + targetW + 'x' + targetH + '.jpg';
            a.href = finalCanvas.toDataURL('image/jpeg', 1.0);
        } else if (rawBatchFileType === 'png_transparent') {
            a.download = batchName + '-' + fmtSafe + '-' + targetW + 'x' + targetH + '-seffaf.png';
            a.href = finalCanvas.toDataURL('image/png');
        } else {
            a.download = batchName + '-' + fmtSafe + '-' + targetW + 'x' + targetH + '.png';
            a.href = finalCanvas.toDataURL('image/png');
        }
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Memory leak temizligi
        finalCanvas = null;
        ctx = null;
        masterImgObj = null;
    } // for loop end
    } finally {
        window.isExportingTransparent = false;
        drawCanvas.style.zIndex = wz;
        drawCanvas.style.pointerEvents = wp;
        
        document.body.classList.remove('is-exporting');
        if (typeof _wasTplHiddenBatch !== 'undefined' && _wasTplHiddenBatch && typeof window.toggleTemplateVisibility === 'function') {
            window.toggleTemplateVisibility(true);
        }
    }

    batchProgress.style.display='none';
    batchStatus.textContent='Tamamlandı';
    batchPercent.textContent='100%';
    batchBar.style.width='100%';

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: 'Toplu İndirme Tamamlandı',
            text: `${activeBatchFiles.length - startIndex} adet fotoğraf başarıyla işlendi ve indirildi.`,
            background: '#1e293b',
            color: '#fff',
            timer: 2500
        });
    }
}

function readFileUrl(f){
    if (typeof f === 'string') return Promise.resolve(f);
    if (f && f.dataUrl) return Promise.resolve(f.dataUrl);
    return new Promise(r=>{
        const fr=new FileReader();
        fr.onload=e=>r(e.target.result);
        fr.readAsDataURL(f);
    });
}

// ====================================================================
// HER FOTOĞRAF İÇİN SOR (İNTERAKTİF ADIM ADIM TOPLU DÜZENLEME & İNDİRME)
// ====================================================================

window.interactiveBatchState = {
    active: false,
    files: [],
    currentIndex: 0,
    selectedPresetId: 'current',
    prefix: '',
    originalUploadedImgUrl: null,
    isProcessing: false
};

async function startInteractiveBatchExport() {
    let allFiles = (typeof batchFiles !== 'undefined' && batchFiles && batchFiles.length) ? batchFiles : (window.batchFiles || []);
    if ((!allFiles || !allFiles.length) && window.PhotoStagingArchive && window.PhotoStagingArchive.items && window.PhotoStagingArchive.items.length > 0) {
        allFiles = window.PhotoStagingArchive.items.map((it, idx) => ({
            name: (it.title || ('foto_' + (idx + 1))) + '.png',
            dataUrl: it.dataUrl
        }));
    } else if ((!allFiles || !allFiles.length) && document.getElementById('batchInput') && document.getElementById('batchInput').files.length > 0) {
        allFiles = Array.from(document.getElementById('batchInput').files).filter(f => !window.validateImageUpload || window.validateImageUpload(f));
        if (typeof batchFiles !== 'undefined') batchFiles = allFiles;
        window.batchFiles = allFiles;
    }

    if (!allFiles || !allFiles.length) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'info',
                title: 'Fotoğraf Ekleyin',
                text: 'Lütfen önce Görseller veya Giriş sekmesinden düzenlemek istediğiniz fotoğrafları ekleyin.',
                background: '#1e293b',
                color: '#fff'
            });
        } else {
            alert('Lütfen önce dosya ekleyin!');
        }
        return;
    }

    // Pro / Demo Yetki ve Kilit Kontrolü
    if (typeof window.validateExportAllowed === 'function') {
        const check = window.validateExportAllowed();
        if (!check.allowed) {
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
            } else {
                alert('🔒 ' + check.message);
            }
            return;
        }
    }

    const selectedPresetId = document.getElementById('batchPresetSelect') ? document.getElementById('batchPresetSelect').value : 'current';
    const prefixInput = document.getElementById('batchPrefixInput') ? document.getElementById('batchPrefixInput').value.trim() : '';

    window.interactiveBatchState = {
        active: true,
        files: [...allFiles],
        currentIndex: 0,
        selectedPresetId: selectedPresetId,
        prefix: prefixInput,
        originalUploadedImgUrl: typeof uploadedImgUrl !== 'undefined' ? uploadedImgUrl : null,
        isProcessing: false
    };

    // HUD'ı oluştur veya mevcutsa göster
    renderInteractiveBatchHud();
    
    // Fotoğraf sekmesine geç ki kullanıcı tuvali ve filtreleri hemen görsün
    if (typeof window.switchTab === 'function') {
        window.switchTab('photo');
    }

    // 1. Fotoğrafı tuvale yükle
    await loadInteractiveBatchStep(0);
}

function renderInteractiveBatchHud() {
    let hud = document.getElementById('interactiveBatchHud');
    if (!hud) {
        hud = document.createElement('div');
        hud.id = 'interactiveBatchHud';
        hud.className = 'interactive-batch-hud';
        hud.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999999;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border: 1px solid rgba(99, 102, 241, 0.45);
            box-shadow: 0 10px 35px rgba(0, 0, 0, 0.65), 0 0 20px rgba(99, 102, 241, 0.25);
            border-radius: 12px;
            padding: 10px 18px;
            display: flex;
            align-items: center;
            gap: 14px;
            color: #fff;
            max-width: 95vw;
            box-sizing: border-box;
        `;
        document.body.appendChild(hud);
    }
    updateInteractiveBatchHudContent();
}

function updateInteractiveBatchHudContent() {
    const hud = document.getElementById('interactiveBatchHud');
    if (!hud) return;

    const state = window.interactiveBatchState;
    if (!state || !state.files.length) return;

    const currentFile = state.files[state.currentIndex];
    const total = state.files.length;
    const currentNum = state.currentIndex + 1;
    const fileName = currentFile ? currentFile.name : '';
    const fileSizeKb = currentFile ? (currentFile.size / 1024).toFixed(0) + ' KB' : '';

    hud.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-weight: 800; font-size: 13px; padding: 4px 10px; border-radius: 20px; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
                <i class="fa-solid fa-layer-group"></i> <span>${currentNum} / ${total}</span>
            </div>
            <div style="max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <span style="font-weight: 600; font-size: 13px; color: #f8fafc;" title="${fileName}">${fileName}</span>
                <span style="font-size: 11px; color: #94a3b8; margin-left: 4px;">• ${fileSizeKb}</span>
            </div>
        </div>
        <div style="height: 24px; width: 1px; background: rgba(255,255,255,0.15);"></div>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <button type="button" class="hud-btn-next" onclick="interactiveBatchNext(true)" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; font-weight: 700; font-size: 13px; padding: 7px 14px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(16,185,129,0.35);">
                <i class="fa-solid fa-download"></i> İndir ve İlerle
            </button>
            <button type="button" class="hud-btn-skip" onclick="interactiveBatchNext(false)" style="background: #334155; color: #cbd5e1; border: 1px solid #475569; font-weight: 600; font-size: 12px; padding: 7px 11px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-forward-step"></i> Resmi Atla
            </button>
            <button type="button" class="hud-btn-auto" onclick="interactiveBatchAutoRemaining()" style="background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; border: none; font-weight: 600; font-size: 12px; padding: 7px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-bolt"></i> Kalanları İndir
            </button>
            <button type="button" class="hud-btn-cancel" onclick="cancelInteractiveBatch(true)" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); font-size: 12px; padding: 7px 10px; border-radius: 6px; cursor: pointer;" title="İptal Et">
                <i class="fa-solid fa-xmark"></i> İptal
            </button>
        </div>
    `;
}

function updateInteractiveBatchHudButtons(disabled) {
    const hud = document.getElementById('interactiveBatchHud');
    if (!hud) return;
    const btns = hud.querySelectorAll('button');
    btns.forEach(b => {
        b.disabled = disabled;
        b.style.opacity = disabled ? '0.5' : '1';
        b.style.pointerEvents = disabled ? 'none' : 'auto';
    });
    const nextBtn = hud.querySelector('.hud-btn-next');
    if (nextBtn) {
        if (disabled) {
            nextBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> İndiriliyor...';
        } else {
            nextBtn.innerHTML = '<i class="fa-solid fa-download"></i> İndir ve İlerle';
        }
    }
}

async function loadInteractiveBatchStep(index) {
    const state = window.interactiveBatchState;
    if (!state || !state.active) return;

    if (index >= state.files.length) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Toplu Düzenleme Tamamlandı',
                text: `${state.files.length} adet fotoğraf başarıyla işlendi.`,
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#6366f1'
            });
        }
        await cancelInteractiveBatch(false);
        return;
    }

    state.currentIndex = index;
    updateInteractiveBatchHudContent();

    const file = state.files[index];
    const url = await readFileUrl(file);

    // 1. Yeni görseli Image nesnesi olarak yükle
    const img = new Image();
    await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
        img.src = url;
    });

    const natW = img.naturalWidth || img.width || 1920;
    const natH = img.naturalHeight || img.height || 1080;

    // 2. Global değişkenleri ve önbellekleri güncelle
    uploadedImgUrl = url;
    window.uploadedImgUrl = url;
    uploadedImgW = natW;
    window.uploadedImgW = natW;
    uploadedImgH = natH;
    window.uploadedImgH = natH;
    window._globalNativeImg = img;
    window._globalNativeImgSrc = url;

    // WebGL ve filtre önbelleklerini temizle
    window._photoFilterDirty = true;

    // 3. Format ayarı: 'Orijinal Görsel Boyutu' ise tuvali uyarla
    const activeFormat = document.getElementById('exportFormat') ? document.getElementById('exportFormat').value : '16:9 Full HD';
    if (activeFormat === 'Orijinal Görsel Boyutu' && typeof autoAdjustFormat === 'function') {
        autoAdjustFormat(natW, natH);
    }

    // 4. Tuvaldeki tüm fotoğraf katmanlarını ve panellerini güncelle
    const pLayer = document.getElementById('photo-layer');
    if (pLayer) {
        pLayer.dataset.naturalW = natW;
        pLayer.dataset.naturalH = natH;
    }

    document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => {
        p._nativeImg = img;
        p._nativeImgSrc = url;
        p.dataset.savedBg = "url('" + url + "')";
        delete p._cachedGlCanvas; // Eski fotoğraftan kalan WebGL render önbelleğini sil
        delete p.dataset.zpScale;
        delete p.dataset.zpX;
        delete p.dataset.zpY;

        let inner = p.querySelector('.photo-inner-zoom');
        if (!inner) {
            if (typeof _preparePhoto === 'function') _preparePhoto(p);
            inner = p.querySelector('.photo-inner-zoom');
        }
        if (inner) {
            inner.style.backgroundImage = "url('" + url + "')";
        }
        p.style.backgroundImage = 'none';

        if (typeof _applyPhotoTransform === 'function') {
            _applyPhotoTransform(p);
        }
    });

    // 5. Şablon / Canva modu varsa yeniden render et
    if (typeof isCanvaMode !== 'undefined' && isCanvaMode) {
        if (typeof refreshActiveCanvaTemplate === 'function') {
            refreshActiveCanvaTemplate();
        } else if (typeof buildCanvaRender === 'function') {
            buildCanvaRender();
        }
    }

    // 6. Hazır ayar varsa (seçili preset) uygula
    if (state.selectedPresetId && state.selectedPresetId !== 'current') {
        if (window.CustomPresetsManager) {
            window.CustomPresetsManager.applyPreset(state.selectedPresetId);
        } else if (typeof applyPreset === 'function') {
            applyPreset(state.selectedPresetId);
        }
    }

    // 7. Tuval ölçülerini ve çizimleri yeniden çiz
    if (typeof resizeCanvas === 'function') resizeCanvas();
    if (typeof redrawAll === 'function') redrawAll();

    // 8. Toast bildirimi
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: `Fotoğraf ${index + 1} / ${state.files.length}`,
            text: file.name,
            showConfirmButton: false,
            timer: 1400,
            background: '#1e293b',
            color: '#fff'
        });
    }
}

async function interactiveBatchNext(shouldDownload) {
    const state = window.interactiveBatchState;
    if (!state || !state.active || state.isProcessing) return;

    state.isProcessing = true;
    updateInteractiveBatchHudButtons(true);

    try {
        if (shouldDownload) {
            const file = state.files[state.currentIndex];
            const rawBaseName = file ? file.name.replace(/\.[^/.]+$/, "") : `foto-${state.currentIndex + 1}`;
            const batchName = (state.prefix ? state.prefix : '') + rawBaseName;

            try {
                await saveImage(batchName);
            } catch (err) {
                console.error('İnteraktif indirme hatası:', err);
            }
        }

        // Sıradaki fotoğrafa geç
        const nextIndex = state.currentIndex + 1;
        await loadInteractiveBatchStep(nextIndex);
    } catch(e) {
        console.error('interactiveBatchNext hatası:', e);
    } finally {
        if (window.interactiveBatchState) {
            window.interactiveBatchState.isProcessing = false;
            updateInteractiveBatchHudButtons(false);
        }
    }
}

async function interactiveBatchAutoRemaining() {
    const state = window.interactiveBatchState;
    if (!state || !state.active || state.isProcessing) return;

    const remainingCount = state.files.length - state.currentIndex;
    if (remainingCount <= 0) return;

    let confirmed = true;
    if (typeof Swal !== 'undefined') {
        const res = await Swal.fire({
            title: 'Kalanları İndir',
            text: `Kalan ${remainingCount} fotoğraf mevcut ayarlarınızla otomatik indirilsin mi?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Otomatik İndir',
            cancelButtonText: 'Vazgeç',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#64748b',
            background: '#1e293b',
            color: '#fff'
        });
        confirmed = res.isConfirmed;
    } else {
        confirmed = confirm(`Kalan ${remainingCount} fotoğraf otomatik indirilsin mi?`);
    }

    if (!confirmed) return;

    const startIndex = state.currentIndex;
    const presetId = state.selectedPresetId;
    const files = state.files;

    // HUD'ı kapat
    const hud = document.getElementById('interactiveBatchHud');
    if (hud) hud.remove();
    state.active = false;

    // Otomatik toplu indirmeyi startIndex'ten başlat
    startBatchExport({ startIndex, presetId, files });
}

async function cancelInteractiveBatch(restoreOriginal = true) {
    const state = window.interactiveBatchState;
    const hud = document.getElementById('interactiveBatchHud');
    if (hud) hud.remove();

    if (state) {
        state.active = false;
        state.isProcessing = false;
        if (restoreOriginal && state.originalUploadedImgUrl) {
            const origUrl = state.originalUploadedImgUrl;
            try {
                const img = new Image();
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                    img.src = origUrl;
                });

                const natW = img.naturalWidth || img.width || 1920;
                const natH = img.naturalHeight || img.height || 1080;

                uploadedImgUrl = origUrl;
                window.uploadedImgUrl = origUrl;
                uploadedImgW = natW;
                window.uploadedImgW = natW;
                uploadedImgH = natH;
                window.uploadedImgH = natH;
                window._globalNativeImg = img;
                window._globalNativeImgSrc = origUrl;

                window._photoFilterDirty = true;

                const pLayer = document.getElementById('photo-layer');
                if (pLayer) {
                    pLayer.dataset.naturalW = natW;
                    pLayer.dataset.naturalH = natH;
                }

                document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => {
                    p._nativeImg = img;
                    p._nativeImgSrc = origUrl;
                    p.dataset.savedBg = "url('" + origUrl + "')";
                    delete p._cachedGlCanvas;
                    delete p.dataset.zpScale;
                    delete p.dataset.zpX;
                    delete p.dataset.zpY;

                    const inner = p.querySelector('.photo-inner-zoom');
                    if (inner) {
                        inner.style.backgroundImage = "url('" + origUrl + "')";
                    }
                    p.style.backgroundImage = 'none';

                    if (typeof _applyPhotoTransform === 'function') {
                        _applyPhotoTransform(p);
                    }
                });

                if (typeof isCanvaMode !== 'undefined' && isCanvaMode) {
                    if (typeof refreshActiveCanvaTemplate === 'function') {
                        refreshActiveCanvaTemplate();
                    } else if (typeof buildCanvaRender === 'function') {
                        buildCanvaRender();
                    }
                }

                if (typeof resizeCanvas === 'function') resizeCanvas();
                if (typeof redrawAll === 'function') redrawAll();
            } catch(e) {
                console.error('Orijinal görsel geri yüklenirken hata:', e);
            }
        }
    }

    if (restoreOriginal && typeof Swal !== 'undefined') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: 'Toplu düzenleme modu kapatıldı',
            showConfirmButton: false,
            timer: 1500,
            background: '#1e293b',
            color: '#fff'
        });
    }
}

window.startInteractiveBatchExport = startInteractiveBatchExport;
window.interactiveBatchNext = interactiveBatchNext;
window.interactiveBatchAutoRemaining = interactiveBatchAutoRemaining;
window.cancelInteractiveBatch = cancelInteractiveBatch;

async function shareImage(platform) {
    if(!window.html2canvas) return alert('html2canvas yüklenmedi!');
    await ensureFontsLoaded();
    try {
        const c = await html2canvas(canvasEl, {
            useCORS: true,
            allowTaint: false,
            scale: 1, // just standard scale for sharing to be fast
            backgroundColor: null,
            ignoreElements: (el) => isExportIgnoredElement(el),
            onclone: (clonedDoc) => sanitizeExportClone(clonedDoc)
        });
        
        c.toBlob(async (blob) => {
            if (!blob) {
                return alert('Resim oluşturulamadı!');
            }
            const file = new File([blob], 'emlak_tasarimi.jpg', { type: 'image/jpeg' });
            
            // Web Share API support check
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'Emlak Tasarımı',
                        text: 'Yeni emlak tasarımına göz atın!',
                        files: [file]
                    });
                } catch (err) {
                    console.log('Share API iptal veya hata:', err);
                }
            } else {
                alert(platform.charAt(0).toUpperCase() + platform.slice(1) + ' için doğrudan paylaşma tarayıcınızda desteklenmiyor. Lütfen resmi indirip manuel paylaşın.');
            }
        }, 'image/jpeg', 0.9);
    } catch(err) {
        console.error(err);
        alert('Paylaşma hatası: ' + err.message);
    }
}

async function getBase64FromBlobUrl(blobUrl, maxWidth = null) {
    if(!blobUrl || !blobUrl.startsWith('blob:')) return blobUrl;
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            let targetW = img.width;
            let targetH = img.height;
            
            if (maxWidth && img.width > maxWidth) {
                targetW = maxWidth;
                targetH = (img.height / img.width) * maxWidth;
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, targetW, targetH);
            
            // Eğer küçültme yapıldıysa (taslak), kaliteyi de 0.6 yap. Aksi halde orijinal kalite.
            const quality = maxWidth ? 0.6 : 0.8;
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve('');
        img.src = blobUrl;
    });
}

async function getBase64FromCSSUrl(cssUrl) {
    if(!cssUrl || cssUrl === 'none') return '';
    const match = cssUrl.match(/url\(['"]?(.*?)['"]?\)/);
    if(match && match[1]) {
        return await getBase64FromBlobUrl(match[1]);
    }
    return '';
}

function _sanitizeExportImportHtml(html) {
    if (!html) return '';
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
               .replace(/\bon\w+\s*=/gi, 'data-blocked=');
}

async function saveProject() {
    try {
        const state = {
            version: 1,
            currentMode, activeLayout, isCanvaMode, activeCanvaId,
            uploadedImgW: typeof uploadedImgW !== 'undefined' ? uploadedImgW : 1920,
            uploadedImgH: typeof uploadedImgH !== 'undefined' ? uploadedImgH : 1080,
            drawMode,
            drawPaths: (typeof drawPaths !== 'undefined' && Array.isArray(drawPaths)) ? drawPaths.map(p => {
                const clone = Object.assign({}, p);
                delete clone.el;
                delete clone.saberRef;
                return clone;
            }) : [],
            extraFieldCounter, extraFieldsData,
            inputs: {},
            customElements: [],
            customItems: []
        };

        // Resimleri Base64'e çevir ki kalıcı olsun
        const activeUploadedImgUrl = typeof uploadedImgUrl !== 'undefined' ? uploadedImgUrl : window.uploadedImgUrl;
        if (activeUploadedImgUrl) {
            if (activeUploadedImgUrl.startsWith('blob:') && typeof getBase64FromBlobUrl === 'function') {
                state.uploadedImgUrl = await getBase64FromBlobUrl(activeUploadedImgUrl);
            } else {
                state.uploadedImgUrl = activeUploadedImgUrl;
            }
        }

        const elLogo = document.getElementById('elLogo') || document.getElementById('logo_overlay');
        const logoUrlRaw = elLogo ? (elLogo.src || (elLogo.querySelector('img') ? elLogo.querySelector('img').src : '') || (elLogo.style.backgroundImage !== 'none' ? elLogo.style.backgroundImage : '')) : '';
        if (typeof getBase64FromCSSUrl === 'function' && logoUrlRaw) {
            state.logoImgUrl = await getBase64FromCSSUrl(logoUrlRaw);
        }

        state.customSlotImages = window.customSlotImages || {};
        if (window.activeCustomTemplateData) {
            state.customTemplate = window.activeCustomTemplateData;
        }

        // Tüm inputları tara
        document.querySelectorAll('input, select, textarea').forEach(el => {
            if(el.id && el.type !== 'file') {
                state.inputs[el.id] = (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value;
            }
        });

        // 🌟 Şablon Öğelerinin Tam Durumu (Konum, Metin, HTML, Stil ve Görünürlük)
        const curBadge = document.getElementById('elBadge');
        const curPrice = document.getElementById('elPrice');
        const curDetails = document.getElementById('elDetails');
        const curInfoLine = document.getElementById('infoLineText');

        state.templateElements = {
            badge: curBadge ? {
                text: curBadge.innerText,
                html: curBadge.innerHTML,
                style: curBadge.getAttribute('style'),
                className: curBadge.className,
                dataset: Object.assign({}, curBadge.dataset),
                visible: (curBadge.style.visibility !== 'hidden' && curBadge.style.display !== 'none')
            } : null,
            price: curPrice ? {
                text: curPrice.innerText,
                html: curPrice.innerHTML,
                style: curPrice.getAttribute('style'),
                className: curPrice.className,
                dataset: Object.assign({}, curPrice.dataset),
                visible: (curPrice.style.visibility !== 'hidden' && curPrice.style.display !== 'none')
            } : null,
            details: curDetails ? {
                html: curDetails.innerHTML,
                style: curDetails.getAttribute('style'),
                className: curDetails.className,
                dataset: Object.assign({}, curDetails.dataset),
                visible: (curDetails.style.visibility !== 'hidden' && curDetails.style.display !== 'none')
            } : null,
            infoLineHtml: curInfoLine ? curInfoLine.innerHTML : null,
            logo: elLogo ? {
                style: elLogo.getAttribute('style'),
                visible: (elLogo.style.display !== 'none' && elLogo.style.visibility !== 'hidden')
            } : null
        };

        // 🌟 Özel Tasarım Elemanlarını Saf Veri Olarak Kaydet (İkonlar, Yazılar, Callout'lar, Şekiller)
        const customItems = [];
        const canvasW = (typeof canvasEl !== 'undefined' && canvasEl && parseInt(canvasEl.style.width)) ? parseInt(canvasEl.style.width) : 1920;
        const canvasH = (typeof canvasEl !== 'undefined' && canvasEl && parseInt(canvasEl.style.height)) ? parseInt(canvasEl.style.height) : 1080;
        state.canvasW = canvasW;
        state.canvasH = canvasH;

        // A. İkonlar
        document.querySelectorAll('#ui-layer .added-icon, #photo-layer .added-icon, #canvas-container .added-icon, #ui-layer .is-svg-icon').forEach(icon => {
            if (icon.closest('.callout-wrap') || icon.closest('.co-neon-block')) return;
            if (icon.classList.contains('editable-draw')) return;
            const isSvg = icon.classList.contains('is-svg-icon') || !!icon.querySelector('svg');
            const clone = icon.cloneNode(true);
            clone.querySelectorAll('.text-handle').forEach(h => h.remove());
            const char = isSvg ? clone.innerHTML : (clone.textContent || '');
            const left = parseFloat(icon.style.left) || 0;
            const top = parseFloat(icon.style.top) || 0;
            customItems.push({
                kind: 'icon',
                char: char,
                isSvg: isSvg,
                left: left,
                top: top,
                xPercent: canvasW > 0 ? (left / canvasW) : 0,
                yPercent: canvasH > 0 ? (top / canvasH) : 0,
                fontSize: parseFloat(icon.style.fontSize) || 60,
                background: icon.style.background || icon.style.backgroundColor || 'rgba(15,23,42,0.6)',
                color: icon.style.color || '#ffffff',
                borderRadius: icon.style.borderRadius || '50%',
                padding: icon.style.padding || '0.28em',
                label: icon.dataset.label || '',
                dataset: Object.assign({}, icon.dataset)
            });
        });

        // B. Metinler, Rozetler & Çerçeveli Kartlar
        document.querySelectorAll('#ui-layer .canvas-el.draggable, #photo-layer .canvas-el.draggable, #canvas-container .canvas-el.draggable').forEach(el => {
            if (['elBadge', 'elPrice', 'elDetails', 'elLogo', 'badge', 'price', 'details', 'logo_overlay'].includes(el.id)) return;
            if (el.classList.contains('added-icon') || el.classList.contains('is-svg-icon')) return;
            if (el.closest('.callout-wrap') || el.closest('.co-neon-block') || el.closest('.callout-wrapper')) return;
            if (el.classList.contains('normal-el') || el.classList.contains('canva-generated') || el.classList.contains('canva-panel')) return;
            if (el.classList.contains('editable-draw')) return;
            
            const isBadge = el.dataset.label && (el.dataset.label.startsWith('Rozet:') || el.dataset.label.includes('Çerçeveli'));
            const isBox = (el.dataset.label === 'Özel Kutu');
            const text = el.innerText || el.textContent || '';
            const left = parseFloat(el.style.left) || 0;
            const top = parseFloat(el.style.top) || 0;

            customItems.push({
                kind: 'text',
                text: text,
                isBox: isBox,
                isBadge: isBadge,
                label: el.dataset.label || (isBox ? 'Özel Kutu' : 'Serbest Yazı'),
                left: left,
                top: top,
                xPercent: canvasW > 0 ? (left / canvasW) : 0,
                yPercent: canvasH > 0 ? (top / canvasH) : 0,
                fontSize: parseFloat(el.style.fontSize) || 36,
                width: el.style.width || '',
                minWidth: el.style.minWidth || '',
                maxWidth: el.style.maxWidth || '',
                minHeight: el.style.minHeight || '',
                height: el.style.height || '',
                color: el.style.color || '#ffffff',
                background: el.style.background || el.style.backgroundColor || (isBox ? 'rgba(255,255,255,0.9)' : 'transparent'),
                border: el.style.border || (isBox ? '2px solid #000000' : 'none'),
                borderRadius: el.style.borderRadius || (isBox ? '12px' : '0px'),
                padding: el.style.padding || (isBox ? '20px 30px' : '10px'),
                boxShadow: el.style.boxShadow || 'none',
                textShadow: el.style.textShadow || 'none',
                backdropFilter: el.style.backdropFilter || el.style.webkitBackdropFilter || '',
                webkitBackdropFilter: el.style.webkitBackdropFilter || '',
                fontFamily: el.style.fontFamily || '',
                fontWeight: el.style.fontWeight || '',
                textAlign: el.style.textAlign || '',
                whiteSpace: el.style.whiteSpace || '',
                lineHeight: el.style.lineHeight || '',
                letterSpacing: el.style.letterSpacing || '',
                rotation: parseFloat(el.dataset.rotation) || 0,
                dataset: Object.assign({}, el.dataset)
            });
        });

        // C. Callout'lar (SVG ve Neon)
        document.querySelectorAll('#canvas-container .callout-wrap, #workArea .callout-wrap, #canvas-container .co-neon-block').forEach(wrap => {
            const left = parseFloat(wrap.style.left) || 0;
            const top = parseFloat(wrap.style.top) || 0;
            const width = parseFloat(wrap.style.width) || (wrap.offsetWidth || 240);
            const height = parseFloat(wrap.style.height) || (wrap.offsetHeight || 120);
            const scale = parseFloat(wrap.dataset.scale) || 1.0;
            const userScale = parseFloat(wrap.dataset.userScale) || scale;
            const rotation = parseFloat(wrap.dataset.rotation) || 0;
            const isNeon = wrap.classList.contains('co-neon-block');
            
            customItems.push({
                kind: 'callout',
                isNeon: isNeon,
                html: wrap.innerHTML,
                left: left,
                top: top,
                xPercent: canvasW > 0 ? (left / canvasW) : 0,
                yPercent: canvasH > 0 ? (top / canvasH) : 0,
                width: width,
                height: height,
                scale: scale,
                userScale: userScale,
                rotation: rotation,
                dataset: Object.assign({}, wrap.dataset)
            });
        });

        // D. Şekiller (Shapes)
        document.querySelectorAll('#canvas-container .shape-el, #workArea .shape-el').forEach(wrap => {
            const left = parseFloat(wrap.style.left) || 0;
            const top = parseFloat(wrap.style.top) || 0;
            const width = parseFloat(wrap.style.width) || wrap.offsetWidth;
            const height = parseFloat(wrap.style.height) || wrap.offsetHeight;
            const scale = parseFloat(wrap.dataset.scale) || 1.0;
            const userScale = parseFloat(wrap.dataset.userScale) || scale;
            const rotation = parseFloat(wrap.dataset.rotation) || 0;
            
            const clone = wrap.cloneNode(true);
            clone.querySelectorAll('.text-handle, .callout-resizer, .callout-rotator, .callout-controls, .callout-lock-btn, .callout-select-border, .callout-handle-width, .callout-handle-length').forEach(h => h.remove());
            
            customItems.push({
                kind: 'shape',
                html: clone.innerHTML,
                left: left,
                top: top,
                xPercent: canvasW > 0 ? (left / canvasW) : 0,
                yPercent: canvasH > 0 ? (top / canvasH) : 0,
                width: width,
                height: height,
                scale: scale,
                userScale: userScale,
                rotation: rotation,
                dataset: Object.assign({}, wrap.dataset)
            });
        });

        state.customItems = customItems;

        // Geriye dönük uyumluluk için customElements'i de doldur
        document.querySelectorAll('#photo-layer .draggable, #ui-layer .draggable').forEach(el => {
            if(['badge', 'price', 'details', 'logo_overlay', 'elBadge', 'elPrice', 'elDetails', 'elLogo'].includes(el.id)) return;
            state.customElements.push({
                id: el.id,
                className: el.className,
                innerHTML: el.innerHTML,
                style: el.getAttribute('style'),
                dataset: Object.assign({}, el.dataset)
            });
        });

        // 🌟 3D Düzlem & Metin Katmanı Verileri
        if (window.ThreeDEngine && typeof window.ThreeDEngine.getDataToSave === 'function') {
            state.threeDData = window.ThreeDEngine.getDataToSave();
        }

        // Ekstra Arayüz & Görünüm Ayarları
        state.currentFont = typeof currentFont !== 'undefined' ? currentFont : (window.currentFont || localStorage.getItem('emlakstudiom_currentFont') || '');
        state.lastAppliedPalette = window.lastAppliedPalette ? Object.assign({}, window.lastAppliedPalette) : null;
        const formatSelect = document.getElementById('previewFormat');
        state.previewFormat = formatSelect ? formatSelect.value : '16:9 Full HD (YouTube/Banner)';
        state.lastParsedData = window.lastParsedData || null;
        state.smartBadges = window.smartBadges || [];
        state.smartMatchedCallouts = window.smartMatchedCallouts || [];
        state.photoCurves = (window.PhotoCurvesManager && typeof window.PhotoCurvesManager.getState === 'function') ? window.PhotoCurvesManager.getState() : null;
        state.photoMasks = (window.PhotoMasksManager && typeof window.PhotoMasksManager.getState === 'function') ? window.PhotoMasksManager.getState() : null;

        // JSON olarak indir
        const jsonString = JSON.stringify(state);
        const blob = new Blob([jsonString], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'emlak_proje.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch(err) {
        console.error("Save error:", err);
        alert("Proje kaydedilirken bir hata oluştu: " + err.message);
    }
}

window.loadProjectFromFile = function(file) {
    if(!file) return;
    if (typeof window.showAppLoading === 'function') {
        window.showAppLoading('Şablon Yüklendi...', 'Tasarım ve katmanlar tuvale yerleştiriliyor...', 8000);
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const state = JSON.parse(event.target.result);
            if(!state.version) throw new Error("Geçersiz proje veya şablon dosyası");

            currentMode = state.currentMode || 'konut';
            activeLayout = typeof state.activeLayout !== 'undefined' ? state.activeLayout : '';
            isCanvaMode = !!state.isCanvaMode;
            activeCanvaId = state.activeCanvaId || '';
            if(isCanvaMode && !activeCanvaId) isCanvaMode = false;
            uploadedImgW = state.uploadedImgW || 1920;
            uploadedImgH = state.uploadedImgH || 1080;
            drawPaths = (state.drawPaths || []).map(p => {
                p.el = null;
                p.saberRef = null;
                return p;
            });
            window.drawPaths = drawPaths;
            extraFieldCounter = state.extraFieldCounter || 0;
            
            // extraFieldsData is a const, we must mutate its properties
            const newExtra = state.extraFieldsData || {konut:[],arazi:[]};
            extraFieldsData.konut = newExtra.konut || [];
            extraFieldsData.arazi = newExtra.arazi || [];

            // Eski tuval elemanlarını temizle
            document.querySelectorAll('#photo-layer .draggable, #ui-layer .draggable, #canvas-container .draggable, #canvas-container .editable-draw, #photo-layer .editable-draw, #ui-layer .editable-draw, #canvas-container .callout-wrap, #canvas-container .shape-el, #canvas-container .co-neon-block').forEach(el => {
                if(['badge', 'price', 'details', 'logo_overlay', 'elBadge', 'elPrice', 'elDetails', 'elLogo'].includes(el.id)) return;
                el.remove();
            });
            allIcons = [];

            // 1. Önce modu değiştir ki mod değişiminin varsayılan metinleri sonraki input atamasıyla doğru şekilde ezilsin
            if(typeof switchMode === 'function') switchMode(currentMode);

            // 2. Şimdi kullanıcının kaydettiği gerçek input değerlerini yükle
            if(state.inputs) {
                Object.keys(state.inputs).forEach(id => {
                    const el = document.getElementById(id);
                    if(el && el.type !== 'file') {
                        if(el.type === 'checkbox' || el.type === 'radio') el.checked = state.inputs[id];
                        else el.value = state.inputs[id];
                    }
                });
            }

            Object.keys(extraFieldsData).forEach(mode => {
                const c = document.getElementById(mode+'ExtraFields');
                if(c) {
                    c.innerHTML = '';
                    extraFieldsData[mode].forEach(id => {
                        const row = document.createElement('div');
                        row.className = 'extra-field-row';
                        row.id = 'row_'+id;
                        row.innerHTML = '<input type="text" id="lbl_'+id+'" placeholder="Başlık"><input type="text" id="val_'+id+'" placeholder="Değer"><button type="button" class="remove-field" onclick="removeExtraField(\''+id+'\',\''+mode+'\')" title="Bilgiyi Sil"><i class="fa-solid fa-xmark"></i></button>';
                        c.appendChild(row);
                        document.getElementById('lbl_'+id).addEventListener('input', renderData);
                        document.getElementById('val_'+id).addEventListener('input', renderData);
                        
                        if(state.inputs && state.inputs['lbl_'+id]) document.getElementById('lbl_'+id).value = state.inputs['lbl_'+id];
                        if(state.inputs && state.inputs['val_'+id]) document.getElementById('val_'+id).value = state.inputs['val_'+id];
                    });
                }
            });

            if (state.uploadedImgUrl) {
                uploadedImgUrl = state.uploadedImgUrl;
                const pl = document.getElementById('photo-layer');
                if(pl) pl.style.backgroundImage = "url('" + uploadedImgUrl + "')";
                if(typeof trackImageSize === 'function') trackImageSize(uploadedImgUrl);
            }

            const elLogo = document.getElementById('elLogo') || document.getElementById('logo_overlay');
            if(state.logoImgUrl && elLogo) {
                const img = elLogo.querySelector('img');
                if (img) {
                    img.src = state.logoImgUrl;
                    img.style.display = 'block';
                }
                elLogo.src = state.logoImgUrl; 
                elLogo.style.display = 'block';
                elLogo.style.visibility = 'visible';
            }
            
            if (state.customSlotImages) {
                window.customSlotImages = state.customSlotImages;
            } else {
                window.customSlotImages = {};
            }

            // Şablon yerleşimi
            if (state.customTemplate || state.isCustomTemplate) {
                const tpl = state.customTemplate || state;
                window.activeCustomTemplateData = tpl;
                isCanvaMode = true;
                activeCanvaId = 'custom';
                if (typeof window.renderCustomDynamicTemplate === 'function') {
                    window.renderCustomDynamicTemplate(tpl);
                }
            } else if(isCanvaMode) {
                if(typeof refreshActiveCanvaTemplate === 'function') refreshActiveCanvaTemplate();
            } else {
                if(typeof clearCanvaTemplate === 'function') clearCanvaTemplate(true);
                const canvaLayer = document.getElementById('canva-render-layer');
                if (canvaLayer) { canvaLayer.innerHTML = ''; canvaLayer.style.display = 'none'; }
                const photoL = document.getElementById('photo-layer');
                if (photoL) photoL.style.display = 'block';

                document.querySelectorAll('.normal-el').forEach(el => {
                    el.style.display = 'block';
                    el.style.visibility = 'visible';
                });

                if(activeLayout) {
                    if(typeof setTemplate === 'function') setTemplate(activeLayout);
                } else {
                    if(typeof clearAllTemplates === 'function') clearAllTemplates();
                    const b = document.getElementById('elBadge');
                    const p = document.getElementById('elPrice');
                    const d = document.getElementById('elDetails');
                    if(b) b.style.visibility='hidden';
                    if(p) p.style.visibility='hidden';
                    if(d) d.style.visibility='hidden';
                }
            }

            // Temel verileri bas
            if(typeof renderData === 'function') renderData();

            // 🌟 KRİTİK: Kullanıcının kaydettiği şablon öğelerinin son halini (Özel konum, stiller ve metin) geri yükle!
            if (state.templateElements) {
                const te = state.templateElements;
                const curBadge = document.getElementById('elBadge');
                const curPrice = document.getElementById('elPrice');
                const curDetails = document.getElementById('elDetails');
                const curInfoLine = document.getElementById('infoLineText');
                const curLogo = document.getElementById('elLogo') || document.getElementById('logo_overlay');

                if (te.badge && curBadge) {
                    if (te.badge.style) curBadge.setAttribute('style', te.badge.style);
                    if (te.badge.html) curBadge.innerHTML = te.badge.html;
                    else if (te.badge.text) curBadge.innerText = te.badge.text;
                    curBadge.style.visibility = (te.badge.visible !== false) ? 'visible' : 'hidden';
                    curBadge.style.display = (te.badge.visible !== false) ? 'block' : 'none';
                    if (typeof bindDrag === 'function') bindDrag(curBadge);
                }
                if (te.price && curPrice) {
                    if (te.price.style) curPrice.setAttribute('style', te.price.style);
                    if (te.price.html) curPrice.innerHTML = te.price.html;
                    else if (te.price.text) curPrice.innerText = te.price.text;
                    curPrice.style.visibility = (te.price.visible !== false) ? 'visible' : 'hidden';
                    curPrice.style.display = (te.price.visible !== false) ? 'block' : 'none';
                    if (typeof bindDrag === 'function') bindDrag(curPrice);
                }
                if (te.details && curDetails) {
                    if (te.details.style) curDetails.setAttribute('style', te.details.style);
                    if (te.details.html) curDetails.innerHTML = te.details.html;
                    curDetails.style.visibility = (te.details.visible !== false) ? 'visible' : 'hidden';
                    curDetails.style.display = (te.details.visible !== false) ? 'block' : 'none';
                    if (typeof bindDrag === 'function') bindDrag(curDetails);
                }
                if (te.infoLineHtml && curInfoLine) {
                    curInfoLine.innerHTML = te.infoLineHtml;
                    curInfoLine.style.visibility = 'visible';
                    curInfoLine.style.display = 'block';
                }
                if (te.logo && curLogo) {
                    if (te.logo.style) curLogo.setAttribute('style', te.logo.style);
                    curLogo.style.display = (te.logo.visible !== false) ? 'block' : 'none';
                    curLogo.style.visibility = (te.logo.visible !== false) ? 'visible' : 'hidden';
                    if (typeof bindDrag === 'function') bindDrag(curLogo);
                }
            }

            // 🌟 Özel Tasarım Elemanlarını Geri Yükle (İkonlar, Yazılar, Callout'lar, Şekiller)
            const targetCanvasW = (typeof canvasEl !== 'undefined' && canvasEl && parseInt(canvasEl.style.width)) ? parseInt(canvasEl.style.width) : 1920;
            const targetCanvasH = (typeof canvasEl !== 'undefined' && canvasEl && parseInt(canvasEl.style.height)) ? parseInt(canvasEl.style.height) : 1080;
            const uiLayer = document.getElementById('ui-layer') || document.getElementById('canvas-container');

            if (state.customItems && Array.isArray(state.customItems) && state.customItems.length > 0) {
                state.customItems.forEach(item => {
                    if (!item || !item.kind) return;
                    
                    if (item.kind === 'icon') {
                        const icon = document.createElement('div');
                        icon.className = 'draggable added-icon canvas-el' + (item.isSvg ? ' is-svg-icon' : '');
                        if (item.isSvg) {
                            icon.innerHTML = item.char;
                        } else {
                            icon.textContent = item.char;
                        }
                        icon.dataset.label = item.label || ('İkon: ' + (item.isSvg ? 'SVG' : item.char));
                        if (item.dataset) {
                            Object.keys(item.dataset).forEach(k => { icon.dataset[k] = item.dataset[k]; });
                        }
                        const posX = typeof item.left !== 'undefined' ? item.left : Math.round(item.xPercent * targetCanvasW);
                        const posY = typeof item.top !== 'undefined' ? item.top : Math.round(item.yPercent * targetCanvasH);
                        icon.style.position = 'absolute';
                        icon.style.left = posX + 'px';
                        icon.style.top = posY + 'px';
                        icon.style.fontSize = (item.fontSize || 60) + 'px';
                        icon.style.padding = item.padding || '0.28em';
                        icon.style.borderRadius = item.borderRadius || '50%';
                        icon.style.background = item.background || 'rgba(15,23,42,0.6)';
                        icon.style.color = item.color || '#ffffff';
                        icon.style.zIndex = '9999';
                        icon.style.display = 'flex';
                        icon.style.alignItems = 'center';
                        icon.style.justifyContent = 'center';
                        icon.style.visibility = 'visible';
                        
                        if (uiLayer) uiLayer.appendChild(icon);
                        if (typeof bindDrag === 'function') bindDrag(icon);
                        if (typeof allIcons !== 'undefined' && !allIcons.includes(icon)) {
                            allIcons.push(icon);
                        }
                    } else if (item.kind === 'text') {
                        const el = document.createElement('div');
                        const isBox = !!item.isBox;
                        const isBadge = !!item.isBadge;
                        el.className = 'draggable canvas-el' + (isBadge ? ' sh-badge' : (isBox ? ' sh-box custom-text-box' : ''));
                        el.innerText = item.text || '';
                        el.dataset.label = item.label || (isBox ? 'Özel Kutu' : 'Serbest Yazı');
                        if (isBox) el.dataset.isCustomBox = 'true';
                        if (item.dataset) {
                            Object.keys(item.dataset).forEach(k => { el.dataset[k] = item.dataset[k]; });
                        }
                        const posX = typeof item.left !== 'undefined' ? item.left : Math.round(item.xPercent * targetCanvasW);
                        const posY = typeof item.top !== 'undefined' ? item.top : Math.round(item.yPercent * targetCanvasH);
                        el.style.position = 'absolute';
                        el.style.left = posX + 'px';
                        el.style.top = posY + 'px';
                        el.style.fontSize = (item.fontSize || 36) + 'px';
                        if (item.width) el.style.width = item.width;
                        if (item.minWidth) el.style.minWidth = item.minWidth;
                        if (item.maxWidth) el.style.maxWidth = item.maxWidth;
                        if (item.minHeight) el.style.minHeight = item.minHeight;
                        if (item.height) el.style.height = item.height;
                        el.style.color = item.color || '#ffffff';
                        el.style.background = item.background || (isBox ? 'rgba(255,255,255,0.9)' : 'transparent');
                        el.style.border = item.border || (isBox ? '2px solid #000000' : 'none');
                        el.style.borderRadius = item.borderRadius || (isBox ? '12px' : '0px');
                        el.style.padding = item.padding || (isBox ? '20px 30px' : '10px');
                        if (item.boxShadow) el.style.boxShadow = item.boxShadow;
                        if (item.textShadow) el.style.textShadow = item.textShadow;
                        if (item.backdropFilter) el.style.backdropFilter = item.backdropFilter;
                        if (item.webkitBackdropFilter) el.style.webkitBackdropFilter = item.webkitBackdropFilter;
                        if (item.fontFamily) el.style.fontFamily = item.fontFamily;
                        if (item.fontWeight) el.style.fontWeight = item.fontWeight;
                        if (item.textAlign) el.style.textAlign = item.textAlign;
                        if (item.whiteSpace) el.style.whiteSpace = item.whiteSpace;
                        if (item.lineHeight) el.style.lineHeight = item.lineHeight;
                        if (item.letterSpacing) el.style.letterSpacing = item.letterSpacing;
                        el.style.zIndex = '9999';
                        el.style.display = 'block';
                        el.style.boxSizing = 'border-box';
                        el.style.overflow = 'visible';
                        el.style.visibility = 'visible';
                        
                        if (uiLayer) uiLayer.appendChild(el);
                        if (typeof bindDrag === 'function') bindDrag(el);
                        if (typeof enableInlineEdit === 'function') enableInlineEdit(el);
                        if (typeof window.addTextHandles === 'function') window.addTextHandles(el);
                    } else if (item.kind === 'callout' || item.kind === 'shape') {
                        const workArea = document.getElementById('canvas-container') || document.getElementById('workArea');
                        if (workArea && item.html) {
                            const wrap = document.createElement('div');
                            if (item.kind === 'shape') {
                                wrap.className = 'canvas-el draggable shape-el';
                            } else {
                                wrap.className = item.isNeon ? 'co-neon-block draggable' : 'callout-wrap svg-callout draggable';
                            }
                            wrap.innerHTML = _sanitizeExportImportHtml(item.html);
                            if (item.kind === 'shape') {
                                wrap.querySelectorAll('.text-handle, .callout-resizer, .callout-rotator, .callout-controls, .callout-lock-btn, .callout-select-border, .callout-handle-width, .callout-handle-length').forEach(h => h.remove());
                            }
                            const posX = typeof item.left !== 'undefined' ? item.left : Math.round(item.xPercent * targetCanvasW);
                            const posY = typeof item.top !== 'undefined' ? item.top : Math.round(item.yPercent * targetCanvasH);
                            wrap.style.position = 'absolute';
                            wrap.style.left = posX + 'px';
                            wrap.style.top = posY + 'px';
                            wrap.style.width = (item.width || 240) + 'px';
                            wrap.style.height = (item.height || 120) + 'px';
                            wrap.style.transform = `rotate(${item.rotation || 0}deg) scale(${item.scale || 1.0})`;
                            wrap.style.zIndex = '500';
                            wrap.style.cursor = 'move';
                            wrap.style.display = 'block';
                            wrap.style.visibility = 'visible';

                            wrap.dataset.origCanvasW = targetCanvasW;
                            wrap.dataset.origCanvasH = targetCanvasH;
                            wrap.dataset.userScale = item.userScale || item.scale || 1.0;
                            wrap.dataset.scale = item.scale || 1.0;
                            wrap.dataset.rotation = item.rotation || 0;
                            if (item.dataset) {
                                Object.keys(item.dataset).forEach(k => { wrap.dataset[k] = item.dataset[k]; });
                                if (item.kind === 'shape') {
                                    const bgRgba = (typeof window.hexToRgba === 'function') ? window.hexToRgba(wrap.dataset.bgColor, wrap.dataset.bgOpacity || '100') : wrap.dataset.bgColor;
                                    const bcRgba = (typeof window.hexToRgba === 'function') ? window.hexToRgba(wrap.dataset.borderColor, wrap.dataset.borderOpacity || '100') : wrap.dataset.borderColor;
                                    wrap.style.setProperty('--shape-bg', bgRgba);
                                    wrap.style.setProperty('--shape-border', bcRgba);
                                    wrap.style.setProperty('--shape-border-width', (wrap.dataset.borderWidth || '0') + 'px');
                                    wrap.style.opacity = (wrap.dataset.opacity || '100') / 100;
                                }
                            }

                            workArea.appendChild(wrap);
                            if (!item.isNeon && typeof window.rebindSVGCallout === 'function') {
                                window.rebindSVGCallout(wrap);
                            } else if (item.isNeon && typeof window.rebindNeonCallout === 'function') {
                                window.rebindNeonCallout(wrap);
                            }
                        }
                    }
                });
            } else if (state.customElements && Array.isArray(state.customElements)) {
                // Eski şablon dosyaları için geriye dönük uyumluluk
                state.customElements.forEach(data => {
                    const el = document.createElement('div');
                    if(data.id) el.id = data.id;
                    el.className = data.className;
                    el.innerHTML = data.innerHTML;
                    if(data.style) el.setAttribute('style', data.style);
                    if(data.dataset) {
                        Object.keys(data.dataset).forEach(k => el.dataset[k] = data.dataset[k]);
                    }
                    el.querySelectorAll('.text-handle, .cbtn-del, .callout-resizer, .callout-rotator, .callout-lock-btn').forEach(h => h.remove());

                    const targetParent = document.getElementById('ui-layer') || document.getElementById('photo-layer');
                    if (targetParent) targetParent.appendChild(el);
                    if (typeof bindDrag === 'function') bindDrag(el);
                    else makeDraggable(el);
                    if(el.classList.contains('icon-el') || el.classList.contains('icon-wrap')) {
                        allIcons.push(el);
                    }
                    if(typeof window.addTextHandles === 'function') {
                        window.addTextHandles(el);
                    }
                });
            }

            // Çizim yollarının SVG DOM elemanlarını yeniden oluştur
            if (drawPaths && drawPaths.length > 0) {
                document.querySelectorAll('#canvas-container .editable-draw, #ui-layer .editable-draw').forEach(el => el.remove());
                drawPaths.forEach((p, idx) => {
                    const createFn = (typeof createSVGFromPath === 'function') ? createSVGFromPath : window.createSVGFromPath;
                    if (typeof createFn === 'function') {
                        const el = createFn(p);
                        if (el) {
                            p.el = el;
                            el.dataset.pathIndex = idx;
                            if (p.elId) el.id = p.elId;
                            if (typeof allIcons !== 'undefined' && !allIcons.includes(el)) {
                                allIcons.push(el);
                            }
                        }
                    }
                });
            }

            // 🌟 3D Düzlem & Metin Katmanını Geri Yükle
            if (state.threeDData && window.ThreeDEngine && typeof window.ThreeDEngine.restoreData === 'function') {
                await window.ThreeDEngine.restoreData(state.threeDData);
            }

            // Renk paleti ve font ayarları
            if (state.lastAppliedPalette && typeof applyTemplateTheme === 'function' && state.lastAppliedPalette.bg) {
                window.lastAppliedPalette = state.lastAppliedPalette;
                applyTemplateTheme(
                    state.lastAppliedPalette.bg,
                    state.lastAppliedPalette.accent,
                    state.lastAppliedPalette.titleText || state.lastAppliedPalette.accent || '#ffffff',
                    state.lastAppliedPalette.text,
                    state.lastAppliedPalette.applyBg !== false,
                    state.lastAppliedPalette.glow,
                    state.lastAppliedPalette.name
                );
            }

            const fontToRestore = state.currentFont || '';
            if (fontToRestore) {
                if (typeof currentFont !== 'undefined') currentFont = fontToRestore;
                window.currentFont = fontToRestore;
                const sel = document.getElementById('fontQuickSelect');
                if (sel) sel.value = fontToRestore;
                if (typeof applyFontSettings === 'function') applyFontSettings();
            }

            if(typeof resizeCanvas === 'function') resizeCanvas();
            if(typeof redrawAll === 'function') redrawAll();
            if(typeof updateDrawHistory === 'function') updateDrawHistory();
            if(typeof renderLayers === 'function') renderLayers();
            if(typeof window.saveState === 'function') window.saveState();

            // Tuval ve font yerleşimlerinin %100 oturmasını garantile:
            setTimeout(() => { if(typeof resizeCanvas === 'function') resizeCanvas(); }, 150);
            setTimeout(() => { if(typeof resizeCanvas === 'function') resizeCanvas(); }, 400);

            // Bekleme ekranını tüm yerleşimler kesin olarak tamamlandıktan sonra pürüzsüz kapat:
            setTimeout(() => {
                if (typeof window.hideAppLoading === 'function') {
                    window.hideAppLoading(250);
                }
            }, 800);
        } catch(e) {
            if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
            console.error("Load error:", e);
            alert("Hata Detayı:\n" + e.message + "\n\nStack:\n" + (e.stack || '').split('\n').slice(0,3).join('\n'));
        }
    };
    reader.readAsText(file);
};

function loadProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        window.loadProjectFromFile(file);
    };
    input.click();
}

window.saveImage = saveImage;
window.isExportIgnoredElement = isExportIgnoredElement;
window.sanitizeExportClone = sanitizeExportClone;
window.ensureFontsLoaded = ensureFontsLoaded;
window.downloadOriginalFromDock = function() {
    if (typeof saveImage === 'function') {
        saveImage(null, { forceOriginal: true });
    }
};







