/**
 * ====================================================================
 * EmlakStüdyom Pro 3D Export & Bake Engine
 * modules/three-d-export.js
 * ====================================================================
 * 
 * - 3D Sahneyi 2D Tuvale Aktarma (Hi-Res Bake & Transfer)
 * - Yüksek Çözünürlüklü Dışa Aktarma Hazırlığı (prepareForExport)
 * - Şeffaf Arka Planlı 3D PNG Ekran Görüntüsü (capture3DScreenshot)
 */

(function(window) {
    'use strict';

    const ThreeDExport = {
        /**
         * 3D Sahneyi 2D Çizim Katmanına Aktarır (Bake)
         */
        bakeToCanvas: function() {
            if (!window.ThreeDEngine || typeof window.ThreeDEngine.getExportContext !== 'function') return false;
            const ctx = window.ThreeDEngine.getExportContext();
            const {
                state,
                renderer,
                canvasEl,
                scene,
                camera,
                gridHelper,
                sunGroup,
                sunRayLine,
                cornerPinOverlayEl,
                gizmoOverlayEl,
                requestRender,
                notifyExternalUpdates,
                closeStudio
            } = ctx;

            if (!renderer || !canvasEl || !scene || !camera) return false;

            const prevGrid = state ? state.showPlaneGrid : false;
            const prevPinActive = state ? state.cornerPinActive : false;
            const prevGizmoActive = state ? state.gizmoActive : false;
            if (gridHelper) gridHelper.visible = false;
            if (sunGroup) sunGroup.visible = false;
            if (sunRayLine) sunRayLine.visible = false;
            if (cornerPinOverlayEl) cornerPinOverlayEl.style.display = 'none';
            if (gizmoOverlayEl) gizmoOverlayEl.style.display = 'none';

            const drawCanvas = document.getElementById('draw-layer') || document.getElementById('drawCanvas');
            const photoCanvas = document.querySelector('.photo-render-canvas');

            const nativeW = (photoCanvas && photoCanvas.width > 0) ? photoCanvas.width : (drawCanvas ? drawCanvas.width : 1920);
            const nativeH = (photoCanvas && photoCanvas.height > 0) ? photoCanvas.height : (drawCanvas ? drawCanvas.height : 1080);

            // Geçici Ultra-HD Çözünürlükte Render
            const curW = canvasEl.width;
            const curH = canvasEl.height;
            renderer.setSize(nativeW, nativeH, false);
            camera.aspect = nativeW / nativeH;
            camera.updateProjectionMatrix();

            renderer.render(scene, camera);

            if (drawCanvas && drawCanvas.getContext) {
                const drawCtx = drawCanvas.getContext('2d');
                drawCtx.drawImage(canvasEl, 0, 0, drawCanvas.width, drawCanvas.height);
                if (state) state.hasBaked = true;
            }

            // Boyutları orijinal durumuna geri getir
            renderer.setSize(curW, curH, false);
            camera.aspect = curW / curH;
            camera.updateProjectionMatrix();

            if (gridHelper) gridHelper.visible = !!(state && state.selected && prevGrid);
            if (sunGroup) sunGroup.visible = !!(state && state.selected);
            if (sunRayLine) sunRayLine.visible = !!(state && state.selected);
            if (cornerPinOverlayEl && prevPinActive) cornerPinOverlayEl.style.display = 'block';
            if (gizmoOverlayEl && prevGizmoActive && !prevPinActive) {
                gizmoOverlayEl.style.display = 'block';
                if (typeof window.ThreeDEngine.updateGizmo === 'function') window.ThreeDEngine.updateGizmo();
            }
            if (typeof requestRender === 'function') requestRender();
            if (typeof notifyExternalUpdates === 'function') notifyExternalUpdates();

            // 2D Kaynak Elemanını ve Çiftleri Kalıcı Olarak Temizle
            if (state && state.source2DEl && state.source2DEl.parentNode) {
                try { state.source2DEl.remove(); } catch(e){}
                state.source2DEl = null;
            }
            document.querySelectorAll('[data-converted-to-3d="true"]').forEach(el => {
                try { el.remove(); } catch(e){}
            });

            // 3D Canvas'ı Tuvale Aktarıldığı İçin Gizle
            if (canvasEl) canvasEl.style.display = 'none';

            // 3D Paneli ve Tutamaçları Kapat
            if (typeof closeStudio === 'function') closeStudio();

            if (typeof window.renderLayers === 'function') window.renderLayers();
            if (typeof window.recordHistory === 'function') window.recordHistory('3D Öge Tuvale Aktarıldı');
            if (typeof window.requestAutoSave === 'function') window.requestAutoSave();

            if (window.showToast) {
                window.showToast('✅ 3D Öge Başarıyla Tuvale Aktarıldı!', 3500);
            }
            return true;
        },

        /**
         * İhracat, baskı ve indirme işlemlerinde 3D sahneyi hedef çözünürlükte hazırlar
         */
        prepareForExport: function(targetW, targetH) {
            if (!window.ThreeDEngine || typeof window.ThreeDEngine.getExportContext !== 'function') return null;
            const ctx = window.ThreeDEngine.getExportContext();
            const {
                state,
                renderer,
                canvasEl,
                scene,
                camera,
                elements,
                gridHelper,
                sunGroup,
                sunRayLine,
                requestRender
            } = ctx;

            if (!state || !state.active || !renderer || !canvasEl || !scene || !camera || !elements || elements.length === 0) {
                return null;
            }

            const hasVisible = elements.some(e => e.visible !== false);
            if (!hasVisible) return null;

            // Kılavuzları geçici olarak gizle
            const prevGrid = gridHelper ? gridHelper.visible : false;
            const prevSun = sunGroup ? sunGroup.visible : false;
            const prevRay = sunRayLine ? sunRayLine.visible : false;
            if (gridHelper) gridHelper.visible = false;
            if (sunGroup) sunGroup.visible = false;
            if (sunRayLine) sunRayLine.visible = false;

            // Her ögenin görünürlük durumunu uygula
            elements.forEach(e => {
                if (e.planeGroup) e.planeGroup.visible = (e.visible !== false);
            });

            const curW = canvasEl.width;
            const curH = canvasEl.height;
            const curAspect = camera.aspect;

            const outW = targetW || curW;
            const outH = targetH || curH;

            renderer.setSize(outW, outH, false);
            camera.aspect = outW / outH;
            camera.updateProjectionMatrix();
            renderer.render(scene, camera);

            return {
                canvas: canvasEl,
                restore: () => {
                    renderer.setSize(curW, curH, false);
                    camera.aspect = curAspect;
                    camera.updateProjectionMatrix();
                    if (gridHelper) gridHelper.visible = !!(state.selected && prevGrid);
                    if (sunGroup) sunGroup.visible = !!(state.selected && prevSun);
                    if (sunRayLine) sunRayLine.visible = !!(state.selected && prevRay);
                    if (typeof requestRender === 'function') requestRender();
                }
            };
        },

        /**
         * Sadece 3D sahneyi şeffaf PNG olarak dışa aktarır
         */
        capture3DScreenshot: function(filename = '3d-sahne.png') {
            const exp = this.prepareForExport();
            if (!exp || !exp.canvas) {
                if (window.showToast) window.showToast('Görünür 3D öge bulunamadı', 'warning');
                return null;
            }
            const dataUrl = exp.canvas.toDataURL('image/png');
            exp.restore();

            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            link.remove();
            if (window.showToast) window.showToast('📸 3D Sahne PNG Olarak İndirildi', 'success');
            return dataUrl;
        }
    };

    window.ThreeDExport = ThreeDExport;

    // ThreeDEngine yüklendiyse metodları köprüle
    if (window.ThreeDEngine) {
        window.ThreeDEngine.bakeToCanvas = () => ThreeDExport.bakeToCanvas();
        window.ThreeDEngine.prepareForExport = (w, h) => ThreeDExport.prepareForExport(w, h);
        window.ThreeDEngine.capture3DScreenshot = (fn) => ThreeDExport.capture3DScreenshot(fn);
    }
})(window);
