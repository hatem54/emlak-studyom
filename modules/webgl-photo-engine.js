/**
 * ====================================================================
 * EmlakStüdyom WebGL Photo Engine (Hardware-Accelerated Lightroom Core)
 * modules/webgl-photo-engine.js
 * ====================================================================
 * 
 * Sıfır harici bağımlılıkla çalışan, GPU tabanlı (WebGL 2.0 / 1.0)
 * profesyonel fotoğraf işleme motoru.
 * 
 * Özellikler:
 * - 60 FPS Gerçek Zamanlı GPU Gölgelendiricileri (GLSL)
 * - Pozlama (EV Curve), S-Eğrisi Kontrast, HDR Highlights & Shadows
 * - Kelvin (2000K-10000K) Beyaz Dengesi & Tint
 * - 8-Kanal Profesyonel Emlak HSL (Turuncu ahşap zemin, Turkuaz havuz vb.)
 * - 4-Kanal Ton Eğrisi (RGB, Red, Green, Blue) 256-örnekli 1D LUT
 * - Mimari Perspektif (Dikey/Yatay Keystone, Ufuk Doğrulama, En-Boy)
 * - Lightroom Tarzı Radyal & Doğrusal Gradyan Maskeleme
 * - Tam çözünürlüklü kayıpsız 4K/8K Dışa Aktarma (Export) desteği
 */

(function(window) {
    'use strict';

    class WebGLPhotoEngine {
        constructor() {
            this.gl = null;
            this.canvas = null;
            this.program = null;
            this.initialized = false;
            this.texture = null;
            this.curveTexture = null;
            this.currentImage = null;
            this.currentImageSrc = '';
            
            // Texture boyutu ve viewport takibi
            this.texWidth = 0;
            this.texHeight = 0;
            
            // Varsayılan LUT (Doğrusal / Linear)
            this.lutData = new Uint8Array(256 * 4);
            for (let i = 0; i < 256; i++) {
                this.lutData[i * 4] = i;     // R
                this.lutData[i * 4 + 1] = i; // G
                this.lutData[i * 4 + 2] = i; // B
                this.lutData[i * 4 + 3] = i; // RGB Master
            }

            this.initGL();
        }

        initGL() {
            try {
                this.canvas = document.createElement('canvas');
                this.canvas.width = 1920;
                this.canvas.height = 1080;
                
                const glOpts = {
                    alpha: true,
                    premultipliedAlpha: false,
                    antialias: true,
                    preserveDrawingBuffer: true,
                    powerPreference: 'high-performance'
                };

                this.gl = this.canvas.getContext('webgl2', glOpts) ||
                          this.canvas.getContext('webgl', glOpts) ||
                          this.canvas.getContext('experimental-webgl', glOpts);

                if (!this.gl) {
                    console.warn('WebGL başlatılamadı, Canvas2D yedek motoru kullanılacak.');
                    return;
                }

                this.initShaders();
                this.initBuffers();
                this.initTextures();
                this.initialized = true;
                console.log('✨ WebGL Fotoğraf Motoru Hazır (GPU Donanım Hızlandırmalı)');
            } catch (err) {
                console.error('WebGL başlatma hatası:', err);
                this.initialized = false;
            }
        }

        initShaders() {
            const gl = this.gl;

            // Vertex Shader: Homografi & Keystone Perspektif Dönüşümü
            const vsSource = `
                attribute vec2 a_position;
                attribute vec2 a_texCoord;
                
                uniform float u_vKeystone;   // Dikey eğiklik (-1.0 .. 1.0)
                uniform float u_hKeystone;   // Yatay eğiklik (-1.0 .. 1.0)
                uniform float u_rotate;      // Döndürme (Radyan)
                uniform float u_aspect;      // En-Boy esnetme
                uniform float u_zoom;        // Otomatik sığdırma ölçeği
                
                varying vec2 v_texCoord;

                void main() {
                    vec2 pos = a_position; // -1.0 .. 1.0

                    // 1. Keystone (Perspektif) Deformasyonu
                    float kY = 1.0 + (pos.y * u_vKeystone * 0.4);
                    float kX = 1.0 + (pos.x * u_hKeystone * 0.4);
                    pos.x = pos.x * kY;
                    pos.y = pos.y * kX;

                    // 2. En-Boy Ölçeği (Aspect)
                    if (u_aspect > 0.0) {
                        pos.y = pos.y * (1.0 + u_aspect * 0.5);
                    } else if (u_aspect < 0.0) {
                        pos.x = pos.x * (1.0 - u_aspect * 0.5);
                    }

                    // 3. Döndürme (Straighten)
                    if (abs(u_rotate) > 0.0001) {
                        float c = cos(u_rotate);
                        float s = sin(u_rotate);
                        pos = vec2(pos.x * c - pos.y * s, pos.x * s + pos.y * c);
                    }

                    // 4. Zoom / Sığdırma
                    pos = pos * u_zoom;

                    gl_Position = vec4(pos, 0.0, 1.0);
                    v_texCoord = a_texCoord;
                }
            `;

            // Fragment Shader: 32-bit Kayan Noktalı Profesyonel Lightroom Renk İşi
            const fsSource = `
                precision highp float;
                
                varying vec2 v_texCoord;
                
                uniform sampler2D u_image;
                uniform sampler2D u_curve_lut; // 256x1 1D LUT (R: Red, G: Green, B: Blue, A: RGB Composite)
                
                // Temel Pozlama ve Kontrast
                uniform float u_exposure;      // EV (-2.0 .. +2.0)
                uniform float u_contrast;      // -1.0 .. +1.0
                uniform float u_highlights;    // -1.0 .. +1.0 (HDR Açık Alanlar)
                uniform float u_shadows;       // -1.0 .. +1.0 (HDR Gölgeler)
                uniform float u_whites;        // -1.0 .. +1.0
                uniform float u_blacks;        // -1.0 .. +1.0
                
                // Renk ve Beyaz Dengesi
                uniform float u_temp;          // Kelvin Renk Sıcaklığı (-1.0 .. +1.0)
                uniform float u_tint;          // Yeşil / Magenta (-1.0 .. +1.0)
                uniform float u_saturate;      // 0.0 .. 3.0 (1.0 nötr)
                uniform float u_vibrance;      // -1.0 .. +1.0
                
                // Detay & Efektler
                uniform float u_clarity;       // 0.0 .. 1.0 (Mikro-kontrast)
                uniform float u_dehaze;        // -1.0 .. +1.0
                uniform float u_sepia;         // 0.0 .. 1.0
                uniform float u_grayscale;     // 0.0 .. 1.0
                uniform float u_invert;        // 0.0 .. 1.0
                uniform float u_vignette;      // 0.0 .. 1.0
                uniform float u_hue_rotate;    // -0.5 .. +0.5 (-180° .. +180° Renk Kaydırma)
                
                // Netlik, Keskinlik ve Akıllı AI Netleştirme (DSP Edge Sharpening)
                uniform vec2 u_texel_size;     // 1.0 / width, 1.0 / height
                uniform float u_sharpness;     // 0.0 .. 1.0 (Klasik Keskinlik)
                uniform float u_ai_sharpen;    // 0.0 .. 1.0 (Akıllı AI Netleştirme)
                
                // 8-Kanal HSL Dizileri (0:Red, 1:Orange, 2:Yellow, 3:Green, 4:Aqua, 5:Blue, 6:Purple, 7:Magenta)
                uniform float u_hsl_hue[8];
                uniform float u_hsl_sat[8];
                uniform float u_hsl_lum[8];
                
                // Yerel Maskeleme (Lightroom Tarzı Çoklu Katman & AI Desteği)
                #define MAX_RADIAL 4
                uniform int u_radial_count;
                uniform int u_radial_active[MAX_RADIAL];
                uniform vec2 u_radial_center[MAX_RADIAL];
                uniform vec2 u_radial_radius[MAX_RADIAL];
                uniform float u_radial_angle[MAX_RADIAL];
                uniform float u_radial_feather[MAX_RADIAL];
                uniform float u_radial_spread[MAX_RADIAL]; // 0.0: Keskin Kenar, 1.0: En Saydam Geçiş
                uniform int u_radial_invert[MAX_RADIAL];
                uniform vec4 u_radial_adjust[MAX_RADIAL]; // x: exp, y: temp, z: highlights, w: shadows
                uniform float u_radial_sat[MAX_RADIAL];
                uniform float u_radial_amount[MAX_RADIAL];
                uniform int u_radial_overlay[MAX_RADIAL];

                #define MAX_LINEAR 4
                uniform int u_linear_count;
                uniform int u_linear_active[MAX_LINEAR];
                uniform vec2 u_linear_start[MAX_LINEAR];
                uniform vec2 u_linear_end[MAX_LINEAR];
                uniform float u_linear_feather[MAX_LINEAR];
                uniform float u_linear_spread[MAX_LINEAR]; // 0.0: Keskin Kenar, 1.0: En Saydam Geçiş
                uniform int u_linear_invert[MAX_LINEAR];
                uniform vec4 u_linear_adjust[MAX_LINEAR]; // x: exp, y: temp, z: highlights, w: shadows
                uniform float u_linear_sat[MAX_LINEAR];
                uniform float u_linear_amount[MAX_LINEAR];
                uniform int u_linear_overlay[MAX_LINEAR];

                #define MAX_AI 4
                uniform int u_ai_count;
                uniform int u_ai_active[MAX_AI];
                uniform vec4 u_ai_adjust[MAX_AI];
                uniform float u_ai_sat[MAX_AI];
                uniform float u_ai_amount[MAX_AI];
                uniform int u_ai_invert[MAX_AI];
                uniform int u_ai_overlay[MAX_AI];
                uniform sampler2D u_ai_mask_texture; // R: Sky, G: Ground, B: Subject, A: Person

                // Geriye dönük tekil maske uniformları
                uniform int u_radial_active_legacy;
                uniform int u_linear_active_legacy;
                uniform int u_show_mask_overlay;

                // RGB <-> HSL Yardımcı Fonksiyonları
                vec3 rgb2hsl(vec3 c) {
                    float minV = min(c.r, min(c.g, c.b));
                    float maxV = max(c.r, max(c.g, c.b));
                    float delta = maxV - minV;
                    
                    float h = 0.0;
                    float s = 0.0;
                    float l = (maxV + minV) * 0.5;
                    
                    if (delta > 0.00001) {
                        s = (l < 0.5) ? (delta / (maxV + minV)) : (delta / (2.0 - maxV - minV));
                        if (c.r >= maxV) {
                            h = (c.g - c.b) / delta + ((c.g < c.b) ? 6.0 : 0.0);
                        } else if (c.g >= maxV) {
                            h = (c.b - c.r) / delta + 2.0;
                        } else {
                            h = (c.r - c.g) / delta + 4.0;
                        }
                        h /= 6.0;
                    }
                    return vec3(h, s, l);
                }

                float hue2rgb(float p, float q, float t) {
                    if (t < 0.0) t += 1.0;
                    if (t > 1.0) t -= 1.0;
                    if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
                    if (t < 1.0/2.0) return q;
                    if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
                    return p;
                }

                vec3 hsl2rgb(vec3 hsl) {
                    float h = hsl.x;
                    float s = hsl.y;
                    float l = hsl.z;
                    if (s <= 0.00001) return vec3(l);
                    
                    float q = (l < 0.5) ? (l * (1.0 + s)) : (l + s - l * s);
                    float p = 2.0 * l - q;
                    return vec3(
                        hue2rgb(p, q, h + 1.0/3.0),
                        hue2rgb(p, q, h),
                        hue2rgb(p, q, h - 1.0/3.0)
                    );
                }

                // Emlak için 8-Kanal Gauss Ağırlık Dağılımı
                // Merkez Açılar (0..1):
                // Red: 0.0, Orange: 0.083 (30 deg), Yellow: 0.166 (60 deg), Green: 0.333 (120 deg)
                // Aqua: 0.5 (180 deg), Blue: 0.666 (240 deg), Purple: 0.777 (280 deg), Magenta: 0.888 (320 deg)
                float colorWeight(float hue, float target) {
                    float d = abs(hue - target);
                    if (d > 0.5) d = 1.0 - d;
                    // Yumuşak Gauss çanı (saçaklanma ve renk kırılmalarını önler)
                    return exp(-d * d * 85.0);
                }

                // ====================================================
                // Profesyonel Fotoğrafik Ton Motoru (Lightroom Grade)
                // - Saf siyahı (0.0) ve saf beyazı (1.0) korur; beyaz sis/gri tül örtme yapmaz.
                // - Renk tonu (Hue) ve doygunluk (Saturation) oranını %100 korur.
                // - Patlamış gökyüzü / açık pencereleri çamurlaştırmadan yumuşakça kurtarır.
                // ====================================================
                vec3 adjustTonePhotographic(vec3 color, float shadows, float highlights, float blacks, float whites) {
                    float lum = dot(color, vec3(0.2126, 0.7152, 0.0722));
                    if (lum < 0.0001) {
                        if (blacks > 0.0) {
                            return vec3(clamp(blacks * 0.15, 0.0, 1.0));
                        }
                        return color;
                    }

                    float newLum = lum;

                    // 1. Gölgeler (Shadows Lifting / Deepening)
                    // Ayak (Toe) bölgesinde doğal gamma genişlemesi; siyah nokta (0.0) sabit kalır.
                    if (abs(shadows) > 0.001) {
                        if (shadows > 0.0) {
                            float sExp = 1.0 / (1.0 + shadows * 1.35 * pow(1.0 - lum, 2.0));
                            newLum = pow(newLum, sExp);
                        } else {
                            float sExp = 1.0 + (-shadows) * 0.9 * pow(1.0 - lum, 2.0);
                            newLum = pow(newLum, sExp);
                        }
                    }

                    // 2. Açık Alanlar (Highlights Recovery / Boost)
                    // Omuz (Shoulder) bölgesinde yumuşak eğri; saf beyaz (1.0) donuk griye dönmez.
                    if (abs(highlights) > 0.001) {
                        float invY = clamp(1.0 - newLum, 0.0, 1.0);
                        float hWeight = pow(newLum, 1.5);
                        if (highlights < 0.0) {
                            float hComp = -highlights;
                            float hExp = 1.0 / (1.0 + hComp * 1.35 * hWeight);
                            newLum = 1.0 - pow(invY, hExp);
                        } else {
                            float hBoost = highlights;
                            float hExp = 1.0 + hBoost * 1.35 * hWeight;
                            newLum = 1.0 - pow(invY, hExp);
                        }
                    }

                    // 3. Siyahlar & Beyazlar (Black Floor & White Ceiling Clipping Points)
                    // Gölgeler ve Açık Alanlardan farklı olarak histogramın en uç tavan/taban noktalarını ayarlar.
                    if (abs(blacks) > 0.001) {
                        if (blacks > 0.0) {
                            // +Siyahlar: Taban siyah noktasını kaldırır (mat / sinematik yumuşak siyahlar)
                            float bWeight = pow(max(0.0, 1.0 - newLum * 2.5), 1.8);
                            newLum += blacks * 0.16 * bWeight;
                        } else {
                            // -Siyahlar: Derin gölgeleri saf 0.0'a doğru çeker (keskin, tok ve derin kontrast)
                            float bComp = -blacks;
                            float bWeight = pow(max(0.0, 1.0 - newLum * 2.5), 1.4);
                            newLum = max(0.0, newLum - bComp * 0.18 * bWeight * (newLum * 3.5));
                        }
                    }
                    if (abs(whites) > 0.001) {
                        if (whites > 0.0) {
                            // +Beyazlar: Tavan beyazını 1.0'a doğru gerer (parlak tavanlar, canlı güneş ve ışıl ışıl beyazlar)
                            float wWeight = pow(max(0.0, (newLum - 0.40) / 0.60), 1.6);
                            newLum += whites * 0.18 * wWeight * (1.0 - newLum * 0.35);
                        } else {
                            // -Beyazlar: Tavan beyazını aşağı bastırır (aşırı patlamış ışık ve pencereleri yumuşatır)
                            float wComp = -whites;
                            float wWeight = pow(max(0.0, (newLum - 0.45) / 0.55), 1.8);
                            newLum -= wComp * 0.18 * wWeight;
                        }
                    }

                    newLum = clamp(newLum, 0.0, 1.0);

                    // 4. Renk Koruma (Luminance Scaling): RGB oranlarını birebir korur
                    vec3 result = color * (newLum / max(lum, 0.0001));

                    // Gölgeler çok açıldığında renk solgunluğunu önleme (Canlı Gölgeler)
                    if (shadows > 0.0) {
                        float satBoost = 1.0 + shadows * 0.22 * pow(1.0 - lum, 1.5);
                        result = mix(vec3(newLum), result, satBoost);
                    }

                    return clamp(result, 0.0, 1.0);
                }

                void main() {
                    vec4 texColor = texture2D(u_image, v_texCoord);
                    if (texColor.a <= 0.001) {
                        gl_FragColor = vec4(0.0);
                        return;
                    }
                    
                    vec3 rgb = texColor.rgb;
                    
                    // ====================================================
                    // 0. AKILLI AI NETLEŞTİRME & KESKİNLİK (DSP Edge Sharpening)
                    // ====================================================
                    if (u_ai_sharpen > 0.001 || u_sharpness > 0.001) {
                        vec2 t = u_texel_size;
                        vec3 cUp    = texture2D(u_image, v_texCoord + vec2(0.0, -t.y)).rgb;
                        vec3 cDown  = texture2D(u_image, v_texCoord + vec2(0.0,  t.y)).rgb;
                        vec3 cLeft  = texture2D(u_image, v_texCoord + vec2(-t.x, 0.0)).rgb;
                        vec3 cRight = texture2D(u_image, v_texCoord + vec2( t.x, 0.0)).rgb;
                        
                        vec3 cUL = texture2D(u_image, v_texCoord + vec2(-t.x, -t.y)).rgb;
                        vec3 cUR = texture2D(u_image, v_texCoord + vec2( t.x, -t.y)).rgb;
                        vec3 cDL = texture2D(u_image, v_texCoord + vec2(-t.x,  t.y)).rgb;
                        vec3 cDR = texture2D(u_image, v_texCoord + vec2( t.x,  t.y)).rgb;

                        // 8-Komşu Ağırlıklı Yumuşak Doku (Gauss / Box Blur Yaklaşımı)
                        vec3 blurColor = (cUp + cDown + cLeft + cRight) * 0.15 + (cUL + cUR + cDL + cDR) * 0.10;
                        
                        // A. Akıllı AI Netleştirme (Coring Eşikleme & Halo Koruma)
                        if (u_ai_sharpen > 0.001) {
                            float yCenter = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
                            float yBlur   = dot(blurColor, vec3(0.2126, 0.7152, 0.0722));
                            float diffY   = yCenter - yBlur;
                            
                            // Eşikleme (Coring): Düz gökyüzü, çim ve pürüzsüz boyalı duvarlarda gren/gürültü oluşturmaz
                            float coringThreshold = 0.006;
                            if (abs(diffY) > coringThreshold) {
                                float signY = sign(diffY);
                                float effDiff = abs(diffY) - coringThreshold;
                                
                                float gain = u_ai_sharpen * 2.5;
                                float boost = signY * effDiff * gain;
                                
                                // Halo önleme (Aşırı beyaz/siyah kenar yanmalarını sınırlar)
                                boost = clamp(boost, -0.25 * u_ai_sharpen, 0.25 * u_ai_sharpen);
                                
                                float targetY = clamp(yCenter + boost, 0.0, 1.0);
                                float ratio = (yCenter > 0.01) ? (targetY / yCenter) : 1.0;
                                rgb = clamp(rgb * ratio, 0.0, 1.0);
                            }
                        }
                        
                        // B. Klasik Keskinlik (Manual Sharpening)
                        if (u_sharpness > 0.001) {
                            vec3 sharpDiff = rgb - blurColor;
                            rgb = clamp(rgb + sharpDiff * (u_sharpness * 1.5), 0.0, 1.0);
                        }
                    }
                    
                    // ====================================================
                    // 1. POZLAMA (Exposure 2^EV) & BEYAZ DENGESİ (Kelvin)
                    // ====================================================
                    if (abs(u_exposure) > 0.001) {
                        rgb *= pow(2.0, u_exposure);
                    }
                    
                    // Gerçek Optik Renk Sıcaklığı (Kelvin Matrisi)
                    if (abs(u_temp) > 0.001) {
                        if (u_temp > 0.0) {
                            rgb.r += u_temp * 0.22;
                            rgb.g += u_temp * 0.08;
                            rgb.b -= u_temp * 0.20;
                        } else {
                            rgb.r += u_temp * 0.16;
                            rgb.g -= u_temp * 0.04;
                            rgb.b -= u_temp * 0.26;
                        }
                    }
                    
                    // Yeşil / Magenta Tint
                    if (abs(u_tint) > 0.001) {
                        rgb.r += u_tint * 0.12;
                        rgb.g -= u_tint * 0.18;
                        rgb.b += u_tint * 0.12;
                    }
                    
                    rgb = clamp(rgb, 0.0, 1.0);

                    // ====================================================
                    // 2. HDR HIGHLIGHTS (Açık Alanlar) & SHADOWS (Gölgeler)
                    // ====================================================
                    rgb = adjustTonePhotographic(rgb, u_shadows, u_highlights, u_blacks, u_whites);
                    float lum = dot(rgb, vec3(0.2126, 0.7152, 0.0722));

                    // ====================================================
                    // 3. S-EĞRİSİ KONTRAST (Sigmoid Perceptual Contrast)
                    // ====================================================
                    if (abs(u_contrast) > 0.001) {
                        float factor = (1.0 + u_contrast);
                        // Kontrast pivotu 0.5 (ara tonlar)
                        rgb = (rgb - 0.5) * factor + 0.5;
                    }
                    
                    // Netlik (Clarity) & Sis Giderme (Dehaze)
                    if (u_clarity > 0.001) {
                        vec3 cDev = rgb - vec3(lum);
                        rgb += cDev * (u_clarity * 0.45);
                    }
                    if (abs(u_dehaze) > 0.001) {
                        float dWeight = 1.0 - lum;
                        rgb += (rgb - vec3(0.5)) * (u_dehaze * 0.35) * dWeight;
                    }

                    rgb = clamp(rgb, 0.0, 1.0);

                    // ====================================================
                    // 4. TON EĞRİSİ (Tone Curves LUT)
                    // ====================================================
                    // 1D LUT: R = Red curve, G = Green curve, B = Blue curve, A = Composite RGB curve
                    float lutCoordR = rgb.r;
                    float lutCoordG = rgb.g;
                    float lutCoordB = rgb.b;
                    
                    vec4 sampleR = texture2D(u_curve_lut, vec2(lutCoordR, 0.5));
                    vec4 sampleG = texture2D(u_curve_lut, vec2(lutCoordG, 0.5));
                    vec4 sampleB = texture2D(u_curve_lut, vec2(lutCoordB, 0.5));
                    
                    // Önce bağımsız RGB kanalları, sonra Composite RGB eğrisi
                    vec3 curvedRGB;
                    curvedRGB.r = sampleR.r;
                    curvedRGB.g = sampleG.g;
                    curvedRGB.b = sampleB.b;
                    
                    // Composite RGB (A kanalında saklanır)
                    curvedRGB.r = texture2D(u_curve_lut, vec2(curvedRGB.r, 0.5)).a;
                    curvedRGB.g = texture2D(u_curve_lut, vec2(curvedRGB.g, 0.5)).a;
                    curvedRGB.b = texture2D(u_curve_lut, vec2(curvedRGB.b, 0.5)).a;
                    
                    rgb = curvedRGB;

                    // ====================================================
                    // 5. 8-KANAL PROFESYONEL EMLAK HSL & VIBRANCE
                    // ====================================================
                    vec3 hsl = rgb2hsl(rgb);
                    
                    // 8-Kanal Ağırlıkları
                    float wRed     = colorWeight(hsl.x, 0.0);
                    float wOrange  = colorWeight(hsl.x, 0.083); // 30° Parke / Ahşap
                    float wYellow  = colorWeight(hsl.x, 0.166); // 60° Aydınlatma
                    float wGreen   = colorWeight(hsl.x, 0.333); // 120° Peyzaj / Bahçe
                    float wAqua    = colorWeight(hsl.x, 0.500); // 180° Havuz / Deniz
                    float wBlue    = colorWeight(hsl.x, 0.666); // 240° Gökyüzü
                    float wPurple  = colorWeight(hsl.x, 0.777); // 280° Dekor
                    float wMagenta = colorWeight(hsl.x, 0.888); // 320° Vurgu
                    
                    float totalWeight = wRed + wOrange + wYellow + wGreen + wAqua + wBlue + wPurple + wMagenta;
                    if (totalWeight > 0.001) {
                        float shiftH = (wRed * u_hsl_hue[0] + wOrange * u_hsl_hue[1] + wYellow * u_hsl_hue[2] +
                                        wGreen * u_hsl_hue[3] + wAqua * u_hsl_hue[4] + wBlue * u_hsl_hue[5] +
                                        wPurple * u_hsl_hue[6] + wMagenta * u_hsl_hue[7]) / totalWeight;
                                        
                        float shiftS = (wRed * u_hsl_sat[0] + wOrange * u_hsl_sat[1] + wYellow * u_hsl_sat[2] +
                                        wGreen * u_hsl_sat[3] + wAqua * u_hsl_sat[4] + wBlue * u_hsl_sat[5] +
                                        wPurple * u_hsl_sat[6] + wMagenta * u_hsl_sat[7]) / totalWeight;
                                        
                        float shiftL = (wRed * u_hsl_lum[0] + wOrange * u_hsl_lum[1] + wYellow * u_hsl_lum[2] +
                                        wGreen * u_hsl_lum[3] + wAqua * u_hsl_lum[4] + wBlue * u_hsl_lum[5] +
                                        wPurple * u_hsl_lum[6] + wMagenta * u_hsl_lum[7]) / totalWeight;

                        hsl.x = fract(hsl.x + shiftH * 0.15);
                        hsl.y = clamp(hsl.y + shiftS * 0.5, 0.0, 1.0);
                        hsl.z = clamp(hsl.z + shiftL * 0.4, 0.0, 1.0);
                    }
                    
                    // Akıllı Canlılık (Vibrance - Profesyonel Lightroom Standardı)
                    if (abs(u_vibrance) > 0.001) {
                        if (u_vibrance < 0.0) {
                            // Negatif Canlılık: Tüm renkleri homojen ve orantılı olarak desatüre eder.
                            // -1.0 (-100) değerinde görsel istisnasız %100 monokrom siyah-beyaz olur (hiçbir yeşil/turuncu ada kalmaz).
                            hsl.y = clamp(hsl.y * (1.0 + u_vibrance), 0.0, 1.0);
                        } else {
                            // Pozitif Canlılık: Düşük doymuş renklere daha çok etki eder; zaten doymuş renkleri patlatmaz.
                            // Nötr/gri alanları kirletmez (hsl.y = 0 ise 0 kalır).
                            float vBoost = (1.0 - hsl.y) * 1.25;
                            // İnsan ten rengi ve aşırı sıcak tonları korumak için hafif yumuşatma
                            if (hsl.x >= 0.04 && hsl.x <= 0.14) vBoost *= 0.80;
                            hsl.y = clamp(hsl.y * (1.0 + u_vibrance * vBoost), 0.0, 1.0);
                        }
                    }
                    
                    // Global Renk Kaydırma (Hue Rotate)
                    if (abs(u_hue_rotate) > 0.0001) {
                        hsl.x = fract(fract(hsl.x + u_hue_rotate) + 1.0);
                    }
                    
                    rgb = hsl2rgb(hsl);

                    // Genel Doygunluk (Perseptüel Rec.709 / W3C Standart Doygunluk)
                    // HSL yerine insan gözünün parlaklık algısını (Luminance) koruyarak doyum artırır/azaltır.
                    // 0'da kusursuz siyah-beyaz, 1'in üzerinde patlama/bozulma yapmayan doğal doygunluk sağlar.
                    if (abs(u_saturate - 1.0) > 0.001) {
                        float pLum = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
                        rgb = clamp(mix(vec3(pLum), rgb, u_saturate), 0.0, 1.0);
                    }

                    // ====================================================
                    // 6. YEREL MASKELEME (Lightroom Tarzı Çoklu Katman & AI)
                    // ====================================================
                    // A. Radyal Maskeler (Çoklu Katman Desteği)
                    for (int i = 0; i < MAX_RADIAL; i++) {
                        if (i >= u_radial_count) break;
                        if (u_radial_active[i] == 1) {
                            vec2 radCoord = v_texCoord - u_radial_center[i];
                            // Döndürme
                            if (abs(u_radial_angle[i]) > 0.0001) {
                                float cA = cos(u_radial_angle[i]);
                                float sA = sin(u_radial_angle[i]);
                                radCoord = vec2(radCoord.x * cA + radCoord.y * sA, -radCoord.x * sA + radCoord.y * cA);
                            }
                            vec2 scaled = radCoord / max(u_radial_radius[i], vec2(0.001));
                            float dist = length(scaled);
                            
                            // Geçiş Yayılması: 0.0 = Jilet gibi keskin sınır, 1.0 = En saydam, yumuşak kadife geçiş
                            float spread = clamp(u_radial_spread[i], 0.0, 1.0);
                            float rMask = 0.0;
                            if (spread < 0.008) {
                                rMask = dist <= 1.0 ? 1.0 : 0.0;
                            } else {
                                float inner = max(0.0, 1.0 - spread * 0.9);
                                float outer = 1.0 + spread * 0.85;
                                rMask = 1.0 - smoothstep(inner, outer, dist);
                                rMask = smoothstep(0.0, 1.0, rMask);
                            }

                            if (u_radial_invert[i] == 1) rMask = 1.0 - rMask;
                            rMask *= clamp(u_radial_amount[i], 0.0, 2.0);
                            
                            if (rMask > 0.001) {
                                rgb *= pow(2.0, u_radial_adjust[i].x * rMask);
                                rgb.r += u_radial_adjust[i].y * 0.15 * rMask;
                                rgb.b -= u_radial_adjust[i].y * 0.15 * rMask;
                                if (abs(u_radial_adjust[i].z) > 0.001 || abs(u_radial_adjust[i].w) > 0.001) {
                                    rgb = adjustTonePhotographic(rgb, u_radial_adjust[i].w * rMask, u_radial_adjust[i].z * rMask, 0.0, 0.0);
                                }
                                if (abs(u_radial_sat[i] - 1.0) > 0.01) {
                                    vec3 rHsl = rgb2hsl(clamp(rgb, 0.0, 1.0));
                                    rHsl.y = clamp(rHsl.y * mix(1.0, u_radial_sat[i], rMask), 0.0, 1.0);
                                    rgb = hsl2rgb(rHsl);
                                }
                                if (u_radial_overlay[i] == 1 && rMask > 0.01) {
                                    vec3 rubyRed = vec3(0.95, 0.15, 0.25);
                                    rgb = mix(rgb, rubyRed, clamp(rMask * 0.45, 0.0, 0.7));
                                }
                            }
                        }
                    }
                    
                    // B. Doğrusal Gradyan Maskeler (Çoklu Katman Desteği)
                    for (int j = 0; j < MAX_LINEAR; j++) {
                        if (j >= u_linear_count) break;
                        if (u_linear_active[j] == 1) {
                            vec2 dir = u_linear_end[j] - u_linear_start[j];
                            float len = length(dir);
                            if (len > 0.001) {
                                vec2 normDir = dir / len;
                                vec2 toPixel = v_texCoord - u_linear_start[j];
                                float proj = dot(toPixel, normDir) / len;
                                
                                // Geçiş Yayılması: 0.0 = Keskin çizgi, 1.0 = En saydam, yumuşak geçiş
                                float spread = clamp(u_linear_spread[j], 0.0, 1.0);
                                float lMask = 0.0;
                                if (spread < 0.008) {
                                    lMask = proj <= 0.5 ? 1.0 : 0.0;
                                } else {
                                    float halfBand = 0.01 + spread * 0.49;
                                    lMask = 1.0 - smoothstep(0.5 - halfBand, 0.5 + halfBand, proj);
                                    lMask = smoothstep(0.0, 1.0, lMask);
                                }

                                if (u_linear_invert[j] == 1) lMask = 1.0 - lMask;
                                lMask *= clamp(u_linear_amount[j], 0.0, 2.0);
                                
                                if (lMask > 0.001) {
                                    rgb *= pow(2.0, u_linear_adjust[j].x * lMask);
                                    rgb.r += u_linear_adjust[j].y * 0.15 * lMask;
                                    rgb.b -= u_linear_adjust[j].y * 0.15 * lMask;
                                    if (abs(u_linear_adjust[j].z) > 0.001 || abs(u_linear_adjust[j].w) > 0.001) {
                                        rgb = adjustTonePhotographic(rgb, u_linear_adjust[j].w * lMask, u_linear_adjust[j].z * lMask, 0.0, 0.0);
                                    }
                                    if (abs(u_linear_sat[j] - 1.0) > 0.01) {
                                        vec3 lHsl = rgb2hsl(clamp(rgb, 0.0, 1.0));
                                        lHsl.y = clamp(lHsl.y * mix(1.0, u_linear_sat[j], lMask), 0.0, 1.0);
                                        rgb = hsl2rgb(lHsl);
                                    }
                                    if (u_linear_overlay[j] == 1 && lMask > 0.01) {
                                        vec3 rubyRed = vec3(0.95, 0.15, 0.25);
                                        rgb = mix(rgb, rubyRed, clamp(lMask * 0.45, 0.0, 0.7));
                                    }
                                }
                            }
                        }
                    }

                    // C. Akıllı AI Maskeleri (Gökyüzü / Zemin / Ana Öge / Kişi)
                    if (u_ai_count > 0) {
                        vec4 aiSample = texture2D(u_ai_mask_texture, v_texCoord);
                        for (int k = 0; k < MAX_AI; k++) {
                            if (k >= u_ai_count) break;
                            if (u_ai_active[k] == 1) {
                                float aMask = (k == 0) ? aiSample.r : ((k == 1) ? aiSample.g : ((k == 2) ? aiSample.b : aiSample.a));
                                if (u_ai_invert[k] == 1) aMask = 1.0 - aMask;
                                aMask *= clamp(u_ai_amount[k], 0.0, 2.0);

                                if (aMask > 0.001) {
                                    rgb *= pow(2.0, u_ai_adjust[k].x * aMask);
                                    rgb.r += u_ai_adjust[k].y * 0.15 * aMask;
                                    rgb.b -= u_ai_adjust[k].y * 0.15 * aMask;
                                    if (abs(u_ai_adjust[k].z) > 0.001 || abs(u_ai_adjust[k].w) > 0.001) {
                                        rgb = adjustTonePhotographic(rgb, u_ai_adjust[k].w * aMask, u_ai_adjust[k].z * aMask, 0.0, 0.0);
                                    }
                                    if (abs(u_ai_sat[k] - 1.0) > 0.01) {
                                        vec3 aHsl = rgb2hsl(clamp(rgb, 0.0, 1.0));
                                        aHsl.y = clamp(aHsl.y * mix(1.0, u_ai_sat[k], aMask), 0.0, 1.0);
                                        rgb = hsl2rgb(aHsl);
                                    }
                                    if (u_ai_overlay[k] == 1 && aMask > 0.01) {
                                        vec3 rubyRed = vec3(0.95, 0.15, 0.25);
                                        rgb = mix(rgb, rubyRed, clamp(aMask * 0.45, 0.0, 0.7));
                                    }
                                }
                            }
                        }
                    }

                    // ====================================================
                    // 7. SEPIA, SİYAH-BEYAZ & NEGATİF
                    // ====================================================
                    // Fotoğrafik Siyah-Beyaz
                    if (u_grayscale > 0.001) {
                        float bwLum = dot(rgb, vec3(0.299, 0.587, 0.114));
                        rgb = mix(rgb, vec3(bwLum), u_grayscale);
                    }
                    
                    // Fotoğrafik Sepia Split-Toning
                    if (u_sepia > 0.001) {
                        float sLum = dot(rgb, vec3(0.299, 0.587, 0.114));
                        vec3 sepiaColor = vec3(sLum * 1.15, sLum * 0.95, sLum * 0.75);
                        rgb = mix(rgb, sepiaColor, u_sepia);
                    }
                    
                    // Negatif (Invert)
                    if (u_invert > 0.001) {
                        rgb = mix(rgb, vec3(1.0) - rgb, u_invert);
                    }

                    // ====================================================
                    // 8. VIGNETTE (Kenar Karartma)
                    // ====================================================
                    if (u_vignette > 0.001) {
                        vec2 vCoord = (v_texCoord - vec2(0.5)) * vec2(1.0, 1.0);
                        float vDist = length(vCoord);
                        float vFalloff = smoothstep(0.4, 0.85, vDist);
                        rgb *= (1.0 - vFalloff * u_vignette);
                    }

                    gl_FragColor = vec4(clamp(rgb, 0.0, 1.0), texColor.a);
                }
            `;

            const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
            const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);

            this.program = gl.createProgram();
            gl.attachShader(this.program, vs);
            gl.attachShader(this.program, fs);
            gl.linkProgram(this.program);

            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
                console.error('Shader Program Hatası:', gl.getProgramInfoLog(this.program));
            }
        }

        compileShader(type, source) {
            const gl = this.gl;
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader Derleme Hatası:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        initBuffers() {
            const gl = this.gl;
            
            // Fullscreen Quad
            const positions = new Float32Array([
                -1.0, -1.0,
                 1.0, -1.0,
                -1.0,  1.0,
                -1.0,  1.0,
                 1.0, -1.0,
                 1.0,  1.0
            ]);
            
            const texCoords = new Float32Array([
                0.0, 1.0,
                1.0, 1.0,
                0.0, 0.0,
                0.0, 0.0,
                1.0, 1.0,
                1.0, 0.0
            ]);

            this.posBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

            this.texBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
        }

        initTextures() {
            const gl = this.gl;

            // Görsel Dokusu
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            // 1D LUT Ton Eğrisi Dokusu (256x1 RGBA)
            this.curveTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.curveTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            
            this.updateCurveTexture(this.lutData);

            // 3. Akıllı AI Maske Dokusu (RGBA: R=Sky, G=Ground, B=Subject, A=Person)
            this.aiMaskTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.aiMaskTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            // 1x1 Boş başlangıç pikseli
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
        }

        updateCurveTexture(lutData) {
            if (!this.gl || !this.curveTexture) return;
            const gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, this.curveTexture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, lutData);
        }

        uploadImage(img) {
            if (!this.gl || !img) return false;
            const gl = this.gl;
            
            const src = img.src || '';
            const w = img.naturalWidth || img.width || 0;
            const h = img.naturalHeight || img.height || 0;

            // Eğer resim değişmediyse tekrar GPU'ya yükleme (performans kazancı)
            if (this.currentImage === img && this.currentImageSrc === src && this.texWidth === w && this.texHeight === h && w > 0) {
                return true;
            }

            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            
            this.currentImage = img;
            this.currentImageSrc = src;
            this.texWidth = w || 1920;
            this.texHeight = h || 1080;
            return true;
        }

        /**
         * Ayarları toparlayıp GPU uniform'larına aktarır ve çizimi gerçekleştirir
         */
        render(targetWidth, targetHeight, options = {}) {
            if (!this.gl || !this.program) return null;
            const gl = this.gl;

            if (this.canvas.width !== targetWidth || this.canvas.height !== targetHeight) {
                this.canvas.width = targetWidth;
                this.canvas.height = targetHeight;
            }

            gl.viewport(0, 0, targetWidth, targetHeight);
            gl.useProgram(this.program);

            // Buffer bağlantıları
            const aPos = gl.getAttribLocation(this.program, 'a_position');
            gl.enableVertexAttribArray(aPos);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
            gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

            const aTex = gl.getAttribLocation(this.program, 'a_texCoord');
            gl.enableVertexAttribArray(aTex);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
            gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 0, 0);

            // Dokuları bağla
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(gl.getUniformLocation(this.program, 'u_image'), 0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.curveTexture);
            gl.uniform1i(gl.getUniformLocation(this.program, 'u_curve_lut'), 1);

            // 1. Mimari Keystone & Geometri Uniformları
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_vKeystone'), options.vKeystone || 0.0);
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_hKeystone'), options.hKeystone || 0.0);
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_rotate'), ((options.rotate || 0.0) * Math.PI) / 180.0);
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_aspect'), options.aspect || 0.0);
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_zoom'), options.zoom || 1.0);

            // 2. Temel Işık & Dinamik Aralık
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_exposure'), (options.exposure !== undefined ? options.exposure : 0.0));
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_contrast'), (options.contrast !== undefined ? options.contrast : 0.0));
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_highlights'), (options.highlights !== undefined ? options.highlights : 0.0));
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_shadows'), (options.shadows !== undefined ? options.shadows : 0.0));
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_whites'), (options.whites !== undefined ? options.whites : 0.0));
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_blacks'), (options.blacks !== undefined ? options.blacks : 0.0));

            // 3. Renk ve Beyaz Dengesi
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_temp'), (options.temp !== undefined ? options.temp : 0.0));
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_tint'), (options.tint !== undefined ? options.tint : 0.0));
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_saturate'), (options.saturate !== undefined ? options.saturate : 1.0));
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_vibrance'), (options.vibrance !== undefined ? options.vibrance : 0.0));

            // 4. Detay & Efektler
            const texW = this.texWidth || targetWidth || 1920;
            const texH = this.texHeight || targetHeight || 1080;
            gl.uniform2f(gl.getUniformLocation(this.program, 'u_texel_size'), 1.0 / texW, 1.0 / texH);
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_sharpness'), (options.sharpness !== undefined ? options.sharpness : 0.0));
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_ai_sharpen'), (options.aiSharpen !== undefined ? options.aiSharpen : 0.0));
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_clarity'), (options.clarity !== undefined ? options.clarity : 0.0));
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_dehaze'), (options.dehaze !== undefined ? options.dehaze : 0.0));
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_sepia'), (options.sepia !== undefined ? options.sepia : 0.0));
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_grayscale'), (options.grayscale !== undefined ? options.grayscale : 0.0));
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_invert'), (options.invert !== undefined ? options.invert : 0.0));
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_vignette'), (options.vignette !== undefined ? options.vignette : 0.0));
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_hue_rotate'), (options.hueRotate !== undefined ? options.hueRotate : 0.0));

            // 5. 8-Kanal Emlak HSL
            const hslH = options.hslHue || new Float32Array(8);
            const hslS = options.hslSat || new Float32Array(8);
            const hslL = options.hslLum || new Float32Array(8);
            gl.uniform1fv(gl.getUniformLocation(this.program, 'u_hsl_hue'), hslH);
            gl.uniform1fv(gl.getUniformLocation(this.program, 'u_hsl_sat'), hslS);
            gl.uniform1fv(gl.getUniformLocation(this.program, 'u_hsl_lum'), hslL);

            // 6. Radyal Maskeler (Çoklu Katman Desteği)
            const radialList = (options.radialMasks && options.radialMasks.length > 0)
                ? options.radialMasks
                : (options.radialMask && options.radialMask.active ? [options.radialMask] : []);
            const radCount = Math.min(4, radialList.length);
            gl.uniform1i(gl.getUniformLocation(this.program, 'u_radial_count'), radCount);

            for (let i = 0; i < 4; i++) {
                const rad = radialList[i] || {};
                const isActive = (i < radCount && rad.active) ? 1 : 0;
                gl.uniform1i(gl.getUniformLocation(this.program, 'u_radial_active[' + i + ']'), isActive);
                gl.uniform2f(gl.getUniformLocation(this.program, 'u_radial_center[' + i + ']'), rad.cx !== undefined ? rad.cx : 0.5, rad.cy !== undefined ? rad.cy : 0.5);
                gl.uniform2f(gl.getUniformLocation(this.program, 'u_radial_radius[' + i + ']'), rad.rx !== undefined ? rad.rx : 0.25, rad.ry !== undefined ? rad.ry : 0.25);
                gl.uniform1f(gl.getUniformLocation(this.program, 'u_radial_angle[' + i + ']'), (((rad.angle || 0.0) * Math.PI) / 180.0));
                gl.uniform1f(gl.getUniformLocation(this.program, 'u_radial_feather[' + i + ']'), rad.feather !== undefined ? rad.feather : 0.5);
                gl.uniform1f(gl.getUniformLocation(this.program, 'u_radial_spread[' + i + ']'), rad.spread !== undefined ? rad.spread : 0.5);
                gl.uniform1i(gl.getUniformLocation(this.program, 'u_radial_invert[' + i + ']'), rad.invert ? 1 : 0);
                gl.uniform4f(gl.getUniformLocation(this.program, 'u_radial_adjust[' + i + ']'), rad.exposure || 0, rad.temp || 0, rad.highlights || 0, rad.shadows || 0);
                gl.uniform1f(gl.getUniformLocation(this.program, 'u_radial_sat[' + i + ']'), rad.saturate !== undefined ? rad.saturate : 1.0);
                gl.uniform1f(gl.getUniformLocation(this.program, 'u_radial_amount[' + i + ']'), rad.amount !== undefined ? rad.amount : 1.0);
                const showRadOver = !!(rad.showOverlay && options.showMaskOverlay);
                gl.uniform1i(gl.getUniformLocation(this.program, 'u_radial_overlay[' + i + ']'), showRadOver ? 1 : 0);
            }

            // 7. Doğrusal Gradyan Maskeler (Çoklu Katman Desteği)
            const linearList = (options.linearMasks && options.linearMasks.length > 0)
                ? options.linearMasks
                : (options.linearMask && options.linearMask.active ? [options.linearMask] : []);
            const linCount = Math.min(4, linearList.length);
            gl.uniform1i(gl.getUniformLocation(this.program, 'u_linear_count'), linCount);

            for (let j = 0; j < 4; j++) {
                const lin = linearList[j] || {};
                const isActive = (j < linCount && lin.active) ? 1 : 0;
                gl.uniform1i(gl.getUniformLocation(this.program, 'u_linear_active[' + j + ']'), isActive);
                gl.uniform2f(gl.getUniformLocation(this.program, 'u_linear_start[' + j + ']'), lin.x1 !== undefined ? lin.x1 : 0.5, lin.y1 !== undefined ? lin.y1 : 0.0);
                gl.uniform2f(gl.getUniformLocation(this.program, 'u_linear_end[' + j + ']'), lin.x2 !== undefined ? lin.x2 : 0.5, lin.y2 !== undefined ? lin.y2 : 0.5);
                gl.uniform1f(gl.getUniformLocation(this.program, 'u_linear_feather[' + j + ']'), lin.feather !== undefined ? lin.feather : 0.5);
                gl.uniform1f(gl.getUniformLocation(this.program, 'u_linear_spread[' + j + ']'), lin.spread !== undefined ? lin.spread : 0.5);
                gl.uniform1i(gl.getUniformLocation(this.program, 'u_linear_invert[' + j + ']'), lin.invert ? 1 : 0);
                gl.uniform4f(gl.getUniformLocation(this.program, 'u_linear_adjust[' + j + ']'), lin.exposure || 0, lin.temp || 0, lin.highlights || 0, lin.shadows || 0);
                gl.uniform1f(gl.getUniformLocation(this.program, 'u_linear_sat[' + j + ']'), lin.saturate !== undefined ? lin.saturate : 1.0);
                gl.uniform1f(gl.getUniformLocation(this.program, 'u_linear_amount[' + j + ']'), lin.amount !== undefined ? lin.amount : 1.0);
                const showLinOver = !!(lin.showOverlay && options.showMaskOverlay);
                gl.uniform1i(gl.getUniformLocation(this.program, 'u_linear_overlay[' + j + ']'), showLinOver ? 1 : 0);
            }

            // 8. Akıllı AI Maskeleri (Gökyüzü / Zemin / Öğe / Kişi)
            const aiList = (options.aiMasks && options.aiMasks.length > 0) ? options.aiMasks : [];
            const aiCount = Math.min(4, aiList.length);
            gl.uniform1i(gl.getUniformLocation(this.program, 'u_ai_count'), aiCount);

            if (aiCount > 0) {
                gl.activeTexture(gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, this.aiMaskTexture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

                if (options.aiMaskBuffer && options.aiMaskBuffer.data) {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, options.aiMaskBuffer.width, options.aiMaskBuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, options.aiMaskBuffer.data);
                    gl.uniform1i(gl.getUniformLocation(this.program, 'u_ai_mask_texture'), 2);
                } else if (options.aiMaskCanvas) {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, options.aiMaskCanvas);
                    gl.uniform1i(gl.getUniformLocation(this.program, 'u_ai_mask_texture'), 2);
                }
            }

            for (let k = 0; k < 4; k++) {
                const ai = aiList[k] || {};
                const isActive = (k < aiCount && ai.active) ? 1 : 0;
                gl.uniform1i(gl.getUniformLocation(this.program, 'u_ai_active[' + k + ']'), isActive);
                gl.uniform4f(gl.getUniformLocation(this.program, 'u_ai_adjust[' + k + ']'), ai.exposure || 0, ai.temp || 0, ai.highlights || 0, ai.shadows || 0);
                gl.uniform1f(gl.getUniformLocation(this.program, 'u_ai_sat[' + k + ']'), ai.saturate !== undefined ? ai.saturate : 1.0);
                gl.uniform1f(gl.getUniformLocation(this.program, 'u_ai_amount[' + k + ']'), ai.amount !== undefined ? ai.amount : 1.0);
                gl.uniform1i(gl.getUniformLocation(this.program, 'u_ai_invert[' + k + ']'), ai.invert ? 1 : 0);
                const showAiOver = !!(ai.showOverlay && options.showMaskOverlay);
                gl.uniform1i(gl.getUniformLocation(this.program, 'u_ai_overlay[' + k + ']'), showAiOver ? 1 : 0);
            }

            // Maske Kılavuz Gösterimi (Geriye Dönük)
            gl.uniform1i(gl.getUniformLocation(this.program, 'u_show_mask_overlay'), options.showMaskOverlay ? 1 : 0);

            // Çiz
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            return this.canvas;
        }

        /**
         * Hedef Canvas üzerine (ör. .photo-render-canvas) doğrudan aktarım
         */
        renderToCanvas(targetCanvas, sourceImage, options = {}) {
            if (!this.initialized || !sourceImage) return false;
            
            this.uploadImage(sourceImage);
            
            const w = targetCanvas.width;
            const h = targetCanvas.height;
            const glCanvas = this.render(w, h, options);
            if (!glCanvas) return false;

            const ctx = targetCanvas.getContext('2d');
            if (!ctx) return false;
            
            ctx.clearRect(0, 0, w, h);
            if (options.blur && options.blur > 0) {
                ctx.filter = 'blur(' + options.blur + 'px)';
            } else {
                ctx.filter = 'none';
            }
            ctx.drawImage(glCanvas, 0, 0);
            ctx.filter = 'none';
            return true;
        }

        /**
         * Dışa aktarma (Export) için tam çözünürlüklü GPU çıktısı üretir
         */
        getProcessedCanvas(sourceImage, options = {}) {
            if (!this.initialized || !sourceImage) return sourceImage;
            
            this.uploadImage(sourceImage);
            
            const natW = sourceImage.naturalWidth || sourceImage.width || 1920;
            const natH = sourceImage.naturalHeight || sourceImage.height || 1080;
            
            const glCanvas = this.render(natW, natH, options);
            if (!glCanvas) return sourceImage;
            
            // Yeni bir canvas'a kopyala (WebGL context kaybını önlemek için)
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = natW;
            exportCanvas.height = natH;
            const eCtx = exportCanvas.getContext('2d');
            if (options.blur && options.blur > 0) {
                const blurScale = Math.max(1.0, natW / 1920.0);
                eCtx.filter = 'blur(' + (options.blur * blurScale) + 'px)';
            } else {
                eCtx.filter = 'none';
            }
            eCtx.drawImage(glCanvas, 0, 0);
            eCtx.filter = 'none';
            return exportCanvas;
        }
    }

    window.WebGLPhotoEngine = new WebGLPhotoEngine();
})(window);
