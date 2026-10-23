/**
 * Emlak Stüdyom - Central Security & Input Guard
 * 
 * Tüm harici dosya, KML/KMZ, JSON şablon, görsel ve 3D giriş noktalarını
 * zararlı kod enjeksiyonlarına (XSS, XXE, Script Injection), dosya uzantı sahteciliğine,
 * dekompresyon bombalarına (RAM/GPU çökmesi) ve bozuk veri kilitlenmelerine karşı korur.
 */
(function(window) {
    'use strict';

    const SecurityGuard = {
        /**
         * HTML Kodunu Güvenli Şekilde Temizler (DOMPurify destekli)
         */
        sanitizeHtml: function(dirtyHtml) {
            if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';
            if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
                return window.DOMPurify.sanitize(dirtyHtml, {
                    ALLOWED_TAGS: [
                        'b', 'i', 'em', 'strong', 'span', 'p', 'br', 'div', 
                        'svg', 'path', 'g', 'circle', 'rect', 'line', 'polyline', 'polygon',
                        'defs', 'lineargradient', 'radialgradient', 'stop', 'filter', 'fegaussianblur', 'femerge', 'femergenode'
                    ],
                    ALLOWED_ATTR: [
                        'style', 'class', 'id', 'width', 'height', 'viewBox', 'd', 'fill', 
                        'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 
                        'transform', 'opacity', 'color', 'cx', 'cy', 'r', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'data-*'
                    ],
                    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'button', 'link', 'meta', 'applet'],
                    FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onkeydown', 'onkeyup', 'javascript:']
                });
            }
            return this.escapeHtml(dirtyHtml);
        },

        /**
         * Düz Metin Olarak Gösterilecek Dizgileri HTML Karakterlerinden Arındırır
         */
        escapeHtml: function(str) {
            if (str === null || str === undefined) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        },

        /**
         * JSON İçe Aktarımında 'id' ve 'key' Değerlerini Doğrular (Onclick JS Enjeksiyon Engeli)
         */
        sanitizeId: function(id) {
            if (!id) return '';
            return String(id).replace(/[^a-zA-Z0-9_\-]/g, '');
        },

        /**
         * Görsel Dosyalarını Kapsamlı Güvenlik Süzgecinden Geçirir (Asenkron)
         * - Boyut ve sıfır bayt kontrolü
         * - Çalıştırılabilir uzantı engeli
         * - SVG XSS / Script taraması
         * - Gerçek görsel çözme (decode probe) ve Piksel Bombası koruması (Maks: 8192x8192 px)
         */
        validateImageFileAsync: async function(file, options = {}) {
            if (!file) {
                return { valid: false, error: 'Lütfen bir dosya seçin.' };
            }

            const maxSize = options.maxSize || (35 * 1024 * 1024); // Varsayılan 35MB
            const maxDimension = options.maxDimension || 8192; // Maksimum piksel kenarı
            const maxPixels = options.maxPixels || 40000000; // Maksimum 40 Megapiksel

            const fileName = (file.name || '').toLowerCase();
            const fileType = (file.type || '').toLowerCase();
            const fileSize = file.size || 0;

            // 1. Boş (0 bayt) dosya kontrolü
            if (fileSize === 0) {
                return { valid: false, error: 'Seçilen dosya boş (0 bayt) veya hasarlı.' };
            }

            // 2. Maksimum dosya boyutu kontrolü
            if (fileSize > maxSize) {
                const mb = Math.round(maxSize / (1024 * 1024));
                return { valid: false, error: `Dosya boyutu çok yüksek (maksimum ${mb} MB desteklenmektedir).` };
            }

            // 3. Zararlı çalıştırılabilir uzantı engeli (Kara liste)
            const dangerousExtensions = [
                '.exe', '.bat', '.cmd', '.sh', '.php', '.phtml', '.js', '.vbs', 
                '.ps1', '.py', '.pl', '.jar', '.apk', '.msi', '.dll', '.scr', 
                '.com', '.hta', '.html', '.htm', '.xhtml', '.shtml', '.asp', '.aspx',
                '.cgi', '.bin', '.wsf', '.reg'
            ];
            if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
                return { valid: false, error: 'Güvenlik Uyarısı: Seçilen dosya türü çalıştırılabilir veya zararlı kod içerebilir.' };
            }

            // 4. İzin verilen görsel formatları
            const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico', '.bmp', '.jfif', '.heic', '.heif'];
            const isImageMime = fileType.startsWith('image/') || fileType.includes('jpeg') || fileType.includes('png') || fileType.includes('webp');
            const hasAllowedExt = allowedExtensions.some(ext => fileName.endsWith(ext));

            if (!isImageMime && !hasAllowedExt && fileType !== '') {
                return { valid: false, error: 'Lütfen geçerli bir görsel formatı (JPG, PNG, WebP vb.) seçin.' };
            }

            // 5. SVG İçi Zararlı Betik & XSS Taraması
            const isSvg = fileType === 'image/svg+xml' || fileName.endsWith('.svg');
            if (isSvg) {
                try {
                    const text = await file.text();
                    const lowerText = text.toLowerCase();

                    const dangerousPatterns = [
                        '<script', 'javascript:', 'data:text/html', 'onload=',
                        'onerror=', 'onclick=', 'onmouseover=', '<foreignobject',
                        '<iframe', '<embed', '<object', '<!entity'
                    ];

                    const foundPattern = dangerousPatterns.find(pat => lowerText.includes(pat));
                    if (foundPattern) {
                        return { 
                            valid: false, 
                            error: `Güvenlik Uyarısı: SVG dosyasında potansiyel olarak zararlı kod (${foundPattern}) tespit edildi ve engellendi.` 
                        };
                    }
                } catch(svgErr) {
                    return { valid: false, error: 'SVG dosyası okunamadı veya biçimi bozuk.' };
                }
            }

            // 6. Gerçek Görsel Çözümleme ve Piksel Bombası Testi (Decode Probe - Raster görseller için)
            if (!isSvg && !fileName.endsWith('.heic') && !fileName.endsWith('.heif')) {
                try {
                    const objectUrl = URL.createObjectURL(file);
                    try {
                        await new Promise((resolve, reject) => {
                            const testImg = new Image();
                            let timeout = setTimeout(() => {
                                testImg.onload = null;
                                testImg.onerror = null;
                                reject(new Error('Görsel çözümleme zaman aşımına uğradı.'));
                            }, 5000);

                            testImg.onload = () => {
                                clearTimeout(timeout);
                                const w = testImg.naturalWidth || testImg.width || 0;
                                const h = testImg.naturalHeight || testImg.height || 0;

                                if (w <= 0 || h <= 0) {
                                    return reject(new Error('Görsel boyutları geçersiz (0x0 piksel).'));
                                }

                                if (w > maxDimension || h > maxDimension || (w * h > maxPixels)) {
                                    return reject(new Error(`Görsel boyutları aşırı büyük (${w}x${h} piksel). Tarayıcı çökmesini önlemek için maksimum ${maxDimension}x${maxDimension} piksel desteklenmektedir.`));
                                }

                                resolve();
                            };

                            testImg.onerror = () => {
                                clearTimeout(timeout);
                                reject(new Error('Dosya içeriği geçerli bir resim olarak çözümlenemedi (bozuk veya sahte dosya).'));
                            };

                            testImg.src = objectUrl;
                        });
                    } finally {
                        URL.revokeObjectURL(objectUrl);
                    }
                } catch(probeErr) {
                    return { valid: false, error: probeErr.message || 'Dosya geçerli bir görsel değil veya bozuk.' };
                }
            }

            return { valid: true };
        },

        /**
         * KML Metni Güvenlik Denetleyicisi (XXE Engeli)
         */
        validateKmlText: function(kmlText) {
            if (!kmlText || typeof kmlText !== 'string') {
                return { valid: false, error: 'KML verisi boş.' };
            }
            if (/<!ENTITY/i.test(kmlText) || /<!DOCTYPE[^>]*SYSTEM/i.test(kmlText)) {
                return { valid: false, error: 'Güvenlik Uyarısı: KML dosyasında harici XML entity (XXE) yapıları tespit edildi ve engellendi.' };
            }
            return { valid: true };
        },

        /**
         * 3D Model Dosyaları Doğrulayıcısı (GLB / GLTF)
         */
        validate3DFile: function(file) {
            if (!file) return { valid: false, error: 'Lütfen bir 3D model dosyası seçin.' };
            const name = (file.name || '').toLowerCase();
            const size = file.size || 0;
            const max3DSize = 50 * 1024 * 1024; // Maksimum 50 MB

            if (size === 0) return { valid: false, error: '3D model dosyası boş (0 bayt).' };
            if (size > max3DSize) return { valid: false, error: '3D model dosyası çok büyük (maksimum 50 MB olabilir).' };
            if (!name.endsWith('.glb') && !name.endsWith('.gltf')) {
                return { valid: false, error: 'Lütfen geçerli bir .glb veya .gltf 3D model dosyası seçin.' };
            }
            return { valid: true };
        }
    };

    window.SecurityGuard = SecurityGuard;
})(window);
