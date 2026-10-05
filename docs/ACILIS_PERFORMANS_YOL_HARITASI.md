# Açılış Performansı Yol Haritası (Ajanlar Arası Devredilebilir)

> **Bu dosya hem plan hem ilerleme kaydıdır.** Kota bittiğinde ya da oturum yarıda kaldığında, bir sonraki ajan **önce bu dosyayı okur** ve "📍 KALDIĞIMIZ YER" bölümünden devam eder.

---

## 📍 KALDIĞIMIZ YER (her ajan iş bitince/başlarken GÜNCELLER)

| Alan | Değer |
|---|---|
| Son güncelleme | 2026-10-03 12:35 – Faz 1, Faz 2 ve Faz 3 eksiksiz tamamlandı |
| Aktif görev | — (sıradaki: **F4.1**) |
| Yarım kalan görev | Yok |
| Son ölçüm | Eager yerel JS: 4.688 KB (-967 KB) \| Blocking CSS: 233 KB (-538 KB) \| defer'siz script: 95 (-15) \| CDN JS: 5 (-6) \| CDN CSS: 2 (-1) |
| Notlar | Faz 1 (CDN düzenleme/sürüm sabitleme), Faz 2 (asenkron CSS), Faz 3 (on-demand LazyLoader: satellite, zip, pdf, qrcode, video, carousel, saber, voice) tamamlandı. `sw.js` cache: v207-20261003-116. |

### Durum İşaretleri
- `[ ]` başlanmadı
- `[~]` **devam ediyor** (başlarken işaretle, yanına tarih-saat ve ajan notu yaz)
- `[x]` tamamlandı + `node -c` geçti
- `[!]` engellendi / kullanıcı kararı bekliyor (sebebini yaz)
- `[T]` kod bitti, **kullanıcı testi bekliyor**

---

## 0. DEVRALAN AJAN İÇİN KURALLAR (ZORUNLU)

1. **Önce oku:** `AGENTS.md` (proje kuralları) + bu dosyanın tamamı.
2. **Git YASAK:** Kullanıcı açıkça istemedikçe hiçbir git komutu çalıştırma (`git status`, `git ls-files` dahil).
3. **Tarayıcı testi YASAK:** Sadece `node -c <dosya>` ile sentaks kontrolü yap. Canlı test kullanıcıya aittir; her görevin "Kullanıcı Test Listesi"ni yanıtında kullanıcıya ilet.
4. **Satır numaralarına güvenme:** Bu dosyadaki satır numaraları 2026-10-03 tarihlidir, kayabilir. Her zaman dosya adı + arama deseniyle (`Select-String`) yeri doğrula.
5. **Bir seferde tek görev:** Görevi `[~]` yap → uygula → `node -c` → `[x]` veya `[T]` yap → "KALDIĞIMIZ YER" tablosunu güncelle. Yarım bırakma riski varsa görevi küçük adımlara böl ve hangi adımda kaldığını "Notlar"a yaz.
6. **Yarım kalmış `[~]` görev bulursan:** İlgili dosyalarda görevin "Doğrulama" maddelerini kontrol et; yapılmış adımları tespit et, kalanları tamamla. Tahminle üstüne yazma.
7. **Her görev sonrası Service Worker:** `sw.js` içindeki `CACHE_NAME` sürümünü artır (ör. `-113` → `-114`). Yeni lazy dosya eklediysen `CORE_ASSETS` listesini kontrol et.
8. **Geri alma:** Her görevin "Geri Alma" maddesi var. Kullanıcı test sonrası sorun bildirirse önce onu uygula.
9. **Kapsam dışı:** Güvenlik düzeltmeleri, undo/autosave bellek optimizasyonları bu yol haritasının konusu değil (ayrı rapor: `yayin_sonrasi_denetim_raporu.md`).

---

## 1. Sorunun Özeti

`app.html` açılışta **116 script** (105 yerel + 11 CDN) ve **25 CSS** yüklüyor. Yalnızca 5 script `defer`. Build/minify yok.

- Açılışta yerel JS: **~5,7 MB**, CDN JS ile **~7,7 MB** parse/compile ediliyor.
- `<head>` içinde 7 senkron CDN script (pixi, pixi-filters, lucide, dompurify, sweetalert2, html2canvas, supabase) ilk boyamayı blokluyor.
- 22 yerel CSS (~771 KB) render-blocking; bunların büyük kısmı sadece belli sekmelerde gerekli.
- Kullanıcı hiç açmasa bile uydu (~850 KB, Leaflet dahil), 3D (~890 KB), saber/PIXI (~600 KB), şablon oluşturucu, carousel, drone, staging, seslendirme modülleri yükleniyor.

**Hedef:** İlk boyamayı bloklayan kaynakları sıfıra yakın indirmek, açılışta parse edilen JS'i **~7,7 MB → ~3 MB altına** çekmek. Hiçbir özelliği bozmadan.

---

## 2. Ölçüm (Her Fazdan Sonra Tekrar Çalıştır)

Aşağıdaki PowerShell komutunu proje kökünde çalıştır; sonucu Bölüm 9'daki ölçüm tablosuna ekle.

```powershell
$jsKB=0;$cssKB=0;$blockJs=0;$cdnJs=0;$cdnCss=0
Select-String -Path app.html -Pattern '<script[^>]*src=|<link[^>]*stylesheet' | ForEach-Object {
  $l=$_.Line; $p=[regex]::Match($l,'(src|href)="([^"]+)"').Groups[2].Value; $f=($p -split '\?')[0]
  $isCss = $l -match 'stylesheet'; $lazyCss = $l -match 'media="print"'
  if ($p -match '^https?://') { if($isCss){$cdnCss++}else{$cdnJs++} }
  elseif (Test-Path $f) { $kb=(Get-Item $f).Length/1KB; if($isCss){ if(-not $lazyCss){$cssKB+=$kb} } else { $jsKB+=$kb } }
  if (-not $isCss -and $l -notmatch 'defer|async') { $blockJs++ }
}
"Eager yerel JS: {0:N0} KB | Blocking CSS: {1:N0} KB | defer'siz script: {2} | CDN JS: {3} | CDN CSS: {4}" -f $jsKB,$cssKB,$blockJs,$cdnJs,$cdnCss
```

**Başlangıç değeri (2026-10-03, komutla ölçüldü):** Eager yerel JS = 5.655 KB · Blocking CSS = 771 KB · defer'siz script 110 · CDN JS 11 · CDN CSS 3

> Kullanıcıdan isteğe bağlı ölçüm: Chrome DevTools → Lighthouse (Mobil) → Performance skoru, FCP, TBT. Ajan bunu kendisi çalıştırmaz.

---

## 3. Bağımlılık Haritası (Lazy-Load Kararları İçin)

| Modül grubu | Dosyalar (yaklaşık KB) | Dışarıdan kullanan | Lazy uygunluğu |
|---|---|---|---|
| **Uydu** | leaflet.js+css (CDN), satellite-core 277, satellite-cadastre 123, satellite-measure 269 | `main.js` (KML bırakma ~779, ~798, format ~1011), `empty-state.js` (~112), `drone-rig.js` | ✅ **Çok uygun.** `modules/satellite-map.js` içinde `ensureSatelliteMapLoaded()` ve `openSatelliteMapModal` proxy **zaten var**, ama alt modüller app.html'de yine eager yükleniyor |
| **Drone** | drone-rig 28 | Sadece satellite-core | ✅ Uydu paketine dahil et |
| **Saber / PIXI** | pixi.min.js + pixi-filters (CDN, head'de!), saber 83, saber-ui 27, saber-animation 25 | Globaller: `SaberEngine`, `applySaberToPath`, `addSaberToPath`, `previewSaber`, `applySaberToAll`, `applySaberAnimation`, `showSaberAnimModal`, `isSaberAnimationActive` | 🟡 Uygun ama giriş noktaları incelenmeli. PIXI başka hiçbir yerde kullanılmıyor |
| **JSZip / jsPDF** | CDN | carousel-manager, photo-staging, satellite-cadastre | ✅ Kullanım anında `await` ile yükle |
| **QRCode** | CDN + js/modules/qrManager 3 | qrManager | ✅ |
| **Video export** | export-video 26 (+html2canvas) | app.html (2), export.js (1) → `exportAnimatedVideo` | ✅ Proxy fonksiyonla |
| **Carousel** | carousel-manager 23 | app.html (12), photo-staging (3) | ✅ Proxy ile |
| **Seslendirme** | voiceover-studio 36 | app.html (11), smart-suggestions (`VoiceStudio.convertNumbersToWords` guard'lı) | 🟡 Proxy ile |
| **3D motoru** | three-d-engine 660, three-d-textures 60, three-d-grouping 60, three-d-align 20, three-d-export 9, estate-3d-library 79, helvetiker_bold.js 60 | **469 referans**, `autoSave.js` açılışta `ThreeDEngine.restoreData` çağırıyor | 🔴 Riskli. On-demand değil, **idle-time** yükleme (Faz 4) |
| **Şablon oluşturucu** | template-builder 127, template-layouts-data 101, template-shapes-data 38, template-3d-frame 49 ... | app.html (93), state.js, layers.js, drag.js ... | 🔴 Riskli. Idle-time (Faz 4) |
| **Photo staging** | photo-staging 95 | state.js (25), main.js, export.js ... | 🔴 Sıkı bağlı. Idle-time (Faz 4) |
| **lucide** | CDN | icons.js (açılışta ikon render), callout_v2 | ⛔ Açılışta gerekli; sadece head'den body sonuna taşınabilir |
| **DOMPurify, SweetAlert2, Supabase, html2canvas** | CDN | Pek çok yer | ⛔ Eager kalsın; sadece head'den body sonuna taşı |

---

## 4. FAZ 1: Risksiz Hızlı Kazanımlar

### [x] F1.1: Head'deki senkron CDN script'lerini body sonuna taşı
- **Dosya:** `app.html`
- **Ne:** `<head>` içindeki şu 7 script etiketini (yaklaşık satır 75-85) **aynı sırayla**, body sonundaki ilk yerel script'in (`js/fonts.config.js`, ~satır 3286) **hemen öncesine** taşı:
  `pixi.min.js`, `pixi-filters.min.js`, `lucide.min.js`, `purify.min.js`, `sweetalert2@11`, `html2canvas.min.js`, `@supabase/supabase-js@2`
- **Neden güvenli:** Body sonundaki yerel script'ler bunları zaten kendilerinden sonra kullanıyor; sıralama korunduğu için davranış aynı kalır. Head'deki `defer` script'ler (`supabase-client.js` vb.) her durumda tüm senkron script'lerden sonra çalışır.
- **Dikkat:** `<head>` ile body arasındaki **inline** script'lerde `Swal`, `DOMPurify`, `supabase`, `lucide`, `PIXI` kullanımı var mı? Ara: `Select-String app.html -Pattern 'Swal\.|DOMPurify|lucide\.|PIXI\.|supabase\.' ` → satır numarası 3286'dan küçük olan ve **sayfa yüklenirken hemen çalışan** (fonksiyon içinde olmayan) kullanım varsa o script'i de taşı ya da o CDN'i head'de bırak.
- **Doğrulama:** Head'de bu 7 URL kalmamalı; body'de `fonts.config.js` öncesinde 7'si sıralı olmalı.
- **Geri Alma:** Etiketleri head'e geri taşı.
- **Kullanıcı Test Listesi:** Giriş/çıkış, SweetAlert diyaloğu açan bir işlem (ör. silme onayı), ikonların görünmesi, PNG dışa aktarma, saber efekti.

### [x] F1.2: CDN sürümlerini sabitle (redirect ve sürpriz güncelleme önleme)
- **Dosyalar:** `app.html`, `index.html`, `admin.html`
- **Ne:** `sweetalert2@11` → tam sürüm (ör. `sweetalert2@11.x.y/dist/sweetalert2.all.min.js`), `@supabase/supabase-js@2` → tam sürüm (ör. `@supabase/supabase-js@2.x.y/dist/umd/supabase.min.js`). Tam sürümü `https://cdn.jsdelivr.net/npm/<paket>@<major>/package.json` adresini `read_url_content` ile okuyarak bul.
- **Doğrulama:** Üç HTML'de de `@11"` ve `@2"` ile biten sürümsüz URL kalmamalı.
- **Geri Alma:** Eski URL'lere dön.
- **Kullanıcı Test Listesi:** Giriş yapma, bir SweetAlert diyaloğu.

### [x] F1.3: Mükerrer `helvetiker_bold.js` etiketini kaldır
- **Dosya:** `app.html` (~satır 3364: `<script src="assets/fonts/helvetiker_bold.js">`)
- **Neden:** `modules/three-d-engine.js` (~satır 615) bu fontu ihtiyaç anında zaten `loadScript` ile yüklüyor. 60 KB boşa parse ediliyor.
- **Ön kontrol:** `Select-String modules\three-d-engine.js -Pattern "helvetiker_bold.js"` ile lazy yüklemenin hâlâ var olduğunu ve font yoksa yükleyen bir guard (ör. `if (!THREE.FontLoader ...)` / font cache kontrolü) bulunduğunu doğrula.
- **Geri Alma:** Etiketi geri ekle.
- **Kullanıcı Test Listesi:** Sayfayı yenile → 3D Metin Ekle → metin görünüyor mu?

### [x] F1.4: Sürekli çalışan `saber-animation.js` interval'ını durdur
- **Dosya:** `js/saber-animation.js` (~satır 607: `setInterval(tryCreate, 2000)`)
- **Ne:** Interval'ın id'sini sakla; `tryCreate` başarıyla UI'ı oluşturduğunda `clearInterval` çağır. Ayrıca en fazla ~15 denemeden sonra dursun.
- **Neden:** Tüm kullanıcılar için sonsuza kadar her 2 sn'de bir checkbox tarıyor ve `innerHTML` serileştiriyor. Açılış sonrası CPU'yu boşa harcıyor.
- **Geri Alma:** Orijinal satıra dön.
- **Kullanıcı Test Listesi:** Saber animasyonu seçeneği panelde hâlâ görünüyor ve çalışıyor mu?

### [x] F1.5: Google Fonts ağırlıklarını azalt
- **Dosya:** `app.html` (~satır 49)
- **Ne:** `Inter:wght@300;400;500;600;700;800;900` içinden gerçekten kullanılan ağırlıkları tespit et (`Select-String styles.css,css\*.css -Pattern 'font-weight:\s*(\d+)'`). 300, 800, 900 kullanılmıyorsa çıkar. `Space Grotesk` için de aynı.
- **Geri Alma:** Eski URL.
- **Kullanıcı Test Listesi:** Genel görünümde yazı kalınlıklarında bozulma var mı?

**Faz 1 bitince:** Ölçüm komutunu çalıştır, Bölüm 9'a yaz, `sw.js` `CACHE_NAME` artır.

---

## 5. FAZ 2: Render-Blocking CSS'i Asenkron Yap

### [x] F2.1: Özelliğe özel CSS'leri non-blocking yükle
- **Dosya:** `app.html` (~satır 51-73)
- **Ne:** Aşağıdaki CSS'leri şu kalıba çevir (dosya yine yüklenir ama ilk boyamayı bloklamaz):
  ```html
  <link rel="stylesheet" href="css/satellite-map.css?v=..." media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="css/satellite-map.css?v=..."></noscript>
  ```
  **Asenkron yapılacaklar:** `satellite-map.css` (116 KB), `three-d.css` (80 KB), `three-d-textures.css`, `ai-enhancer.css`, `photo-masks.css`, `magic-eraser.css`, `clone-stamp.css`, `template-builder.css`, `template-shapes.css` (170 KB), `template-info-card.css`, `carousel.css`, `photo-staging.css`, `drone-rig.css`, `bezier-curves.css`, `portfolio-presets.css`, Leaflet CSS.
  **Blocking KALACAKLAR** (ilk ekranda görünen arayüz): `styles.css`, `callouts.css`, `dock-contextual.css`, `canvas-tools.css`, `empty-state.css`, `neon-text.css`, `smart-guides.css`, FontAwesome, Google Fonts.
- **Risk:** Asenkron CSS yüklenmeden önce ilgili panel açılırsa çok kısa süre stilsiz görünebilir (pratikte kullanıcı o kadar hızlı tıklayamaz). Kayıtlı bir projede şablon şekilleri açılışta tuvalde görünüyorsa `template-shapes.css` kısa bir an geç uygulanabilir. Kullanıcı bunu görürse sadece o dosyayı blocking'e geri al.
- **Doğrulama:** Ölçüm komutunda "Blocking CSS" ≈ 771 KB → ~300 KB civarına düşmeli.
- **Geri Alma:** `media="print" onload=...` kısmını sil.
- **Kullanıcı Test Listesi:** Sayfayı yenile; şablon oluşturucu, 3D panel, uydu haritası, foto maskeleri, sihirli silgi, carousel panellerini aç; kayıtlı bir şablon projesini yükle. Stil bozukluğu var mı?

**Faz 2 bitince:** Ölçüm + `CACHE_NAME` artır.

---

## 6. FAZ 3: İzole Modülleri İhtiyaç Anında Yükle (On-Demand)

### [x] F3.1: Ortak `LazyLoader` altyapısını oluştur
- **Yeni dosya:** `core/lazy-loader.js` (≤150 satır, AGENTS.md §5)
- **API:**
  ```js
  window.LazyLoader = {
    register(name, { scripts: [...], styles: [...], ready: () => boolean }),
    load(name, { showLoading = true, label } = {}) → Promise<boolean>,  // aynı paket için tek promise (dedupe)
    isLoaded(name) → boolean
  };
  ```
- **Davranış:**
  - Script'leri **sırayla** (`s.async = false`) yükler; aynı URL'i iki kez eklemez (`document.querySelector('script[src*="..."]')` kontrolü).
  - `ready()` true ise hiç yüklemeden döner.
  - `showLoading` true ise `window.showAppLoading/hideAppLoading` kullanır (varsa). Hata durumunda `showAppToast(..., 'error')` (AGENTS.md §2.8: hata bildirimi serbest; başarı toast'ı **atma**).
  - Sürüm parametresi tek yerden: dosyanın başında `const LAZY_V = '20261003-1';`.
- **app.html:** `core/utils.js` etiketinin hemen ardından `<script src="core/lazy-loader.js?v=...">` ekle.
- **Paket kayıtları** bu dosyanın sonunda yapılır (F3.2-F3.7'de doldurulacak).
- **Doğrulama:** `node -c core/lazy-loader.js`.
- **Geri Alma:** Dosyayı ve etiketi kaldır (henüz kimse kullanmıyorsa güvenli).

### [x] F3.2: Uydu + Leaflet + Drone paketi (en büyük ve en güvenli kazanç, ~900 KB)
- **Dosyalar:** `app.html`, `modules/satellite-map.js`, `main.js`, `modules/empty-state.js`, `core/lazy-loader.js`
- **Adımlar:**
  1. `lazy-loader.js` içinde `satellite` paketini kaydet: styles `[leaflet.css, css/satellite-map.css]`, scripts `[leaflet.js (CDN), modules/satellite-core.js, modules/satellite-cadastre.js, modules/satellite-measure.js, modules/drone-rig.js]`, ready: `() => !!(window.SatelliteMapModule && window.SatelliteMapModule.openModal)`.
  2. `modules/satellite-map.js` içindeki `ensureSatelliteMapLoaded` gövdesini `return window.LazyLoader.load('satellite', { label: 'Uydu Haritası' })` yap (LazyLoader yoksa eski kod yedek olarak kalsın).
  3. `app.html`'den şu etiketleri **kaldır**: `leaflet.js` (CDN), `satellite-core.js`, `satellite-cadastre.js`, `satellite-measure.js`, `drone-rig.js`, Leaflet CSS ve `css/satellite-map.css` linkleri. `modules/satellite-map.js` (shim) **kalsın**.
  4. Doğrudan `window.SatelliteMapModule` kullanan çağıranları önce yükleyecek şekilde güncelle:
     - `main.js` KML bırakma/seçme (~779, ~798): fonksiyonu `async` yap, başına `await window.ensureSatelliteMapLoaded();` ekle.
     - `main.js` ~1011 (`getActiveFormatDimensions`): uydu yüklü değilse zaten guard'lı, dokunma (uydu açık değilse anlamsız).
     - `modules/empty-state.js` ~112 (KML): aynı `await` ekle.
  5. app.html'de doğrudan `SatelliteMapModule.` ya da satellite-core globallerini (`toggleGoogle3DMode`, `setSatelliteExportFormat`, `toggleSatelliteLabels` ...) çağıran `onclick` var mı ara. Bunlar uydu modalının **içindeyse** (modal satellite-core tarafından oluşturuluyorsa) sorun yok. Statik HTML'deyse `openSatelliteMapModal()` üzerinden geçir.
  6. `sw.js` `CORE_ASSETS` içindeki satellite dosyaları kalabilir (arka planda önbelleğe alınır, açılışı etkilemez).
- **Doğrulama:** `node -c` (main.js, empty-state.js, satellite-map.js, lazy-loader.js); app.html'de `satellite-core.js` geçmemeli.
- **Geri Alma:** Kaldırılan etiketleri eski sırasıyla geri ekle (shim'den **önce**).
- **Kullanıcı Test Listesi:** Uydu haritasını aç (ilk açılışta kısa yükleme ekranı normal), 2D/3D geçiş, ölçüm, KML dosyası sürükle-bırak (uydu kapalıyken), drone çekimi, uydu görselini tuvale aktarma.

### [x] F3.3: JSZip + jsPDF paketi
- **Ne:** `lazy-loader.js` içinde `zip` (`jszip.min.js`) ve `pdf` (`jspdf.umd.min.js`) paketlerini kaydet. `ready`: `() => !!window.JSZip` / `() => !!(window.jspdf && window.jspdf.jsPDF)`.
- **Çağıranlar:** `JSZip` ve `jspdf|jsPDF` kullanan her fonksiyonun başına `await window.LazyLoader.load('zip')` / `'pdf'` ekle (fonksiyon `async` değilse `async` yap ve çağıranı kontrol et):
  `modules/carousel-manager.js`, `modules/photo-staging.js`, `modules/satellite-cadastre.js`, app.html'deki inline kullanım (1'er adet).
- **app.html:** İki CDN etiketini kaldır.
- **Kullanıcı Test Listesi:** Carousel ZIP indirme, staging PDF/ZIP çıktısı, KMZ dosyası yükleme.

### [x] F3.4: QRCode paketi
- **Ne:** `qrcode` paketi (`qrcode.min.js`, ready: `() => !!window.QRCode`). `js/modules/qrManager.js` içindeki `new QRCode` öncesine `await LazyLoader.load('qrcode', { showLoading:false })`. app.html'deki inline kullanımı da kontrol et.
- **app.html:** CDN etiketini kaldır.
- **Kullanıcı Test Listesi:** QR kod ekleme.

### [x] F3.5: Video export + Carousel
- **Ne:**
  - `video` paketi: `modules/export-video.js`. `export.js` ve app.html'deki `exportAnimatedVideo(...)` çağrılarını `LazyLoader.load('video').then(() => window.exportAnimatedVideo(...))` yap.
  - `carousel` paketi: `css/carousel.css` + `modules/carousel-manager.js`. app.html'deki 12 `CarouselManager.` kullanımını tek bir yardımcıya bağla: `window.withCarousel = fn => LazyLoader.load('carousel').then(() => fn(window.CarouselManager))`. photo-staging'deki 3 kullanımı da aynı şekilde.
- **app.html:** İki script etiketini kaldır.
- **Kullanıcı Test Listesi:** Video indir, carousel oluştur/indir, staging'den carousel'e geçiş.

### [x] F3.6: Saber / PIXI paketi (~600 KB)
- **Ön inceleme (zorunlu):** Saber özelliğinin giriş noktalarını bul:
  `Select-String app.html,modules\*.js,ui\*.js,js\*.js -Pattern 'SaberEngine|applySaberToPath|addSaberToPath|removeSaberFromPath|previewSaber|applySaberToAll|applySaberAnimation|showSaberAnimModal|isSaberAnimationActive|saberState'`
  Açılışta (sayfa yüklenirken) çağrılan bir kullanım var mı, özellikle **autosave geri yükleme** saber'lı bir çizimi yeniden kuruyor mu?
- **Ne:** `saber` paketi: `[pixi.min.js, pixi-filters.min.js, modules/saber.js, ui/saber-ui.js, js/saber-animation.js]`. Her global giriş fonksiyonu için, paket yüklenmemişken çağrılırsa önce yükleyip sonra gerçek fonksiyonu çağıran **proxy** tanımla (proxy'ler `lazy-loader.js` içinde; gerçek modül yüklendiğinde `window.X`'i ezer).
  `isSaberAnimationActive` gibi sorgu fonksiyonları için proxy `false` döndürsün (yüklenmemişse aktif olamaz).
  `saberState` gibi nesneleri okuyan kod varsa `window.saberState` kontrolünün guard'lı olduğunu doğrula.
- **Autosave geri yüklemede saber varsa:** Geri yükleme kodunda saber verisi tespit edildiğinde önce `await LazyLoader.load('saber')`.
- **app.html:** PIXI ve pixi-filters (F1.1'de body'ye taşınmıştı) + 3 saber script etiketini kaldır.
- **Risk:** Orta. Bir giriş noktası atlanırsa saber butonu sessizce çalışmaz. Ön incelemeyi tam yap ve tüm noktaları "Notlar"a listele.
- **Kullanıcı Test Listesi:** Çizime saber ekle/kaldır, önizleme, hepsine uygula, saber animasyonu, saber'lı projeyi kaydet → sayfayı yenile → geri yüklendi mi, saber'lı video export.

### [x] F3.7: Seslendirme stüdyosu
- **Ne:** `voice` paketi: `modules/voiceover-studio.js`. app.html'deki 11 `VoiceStudio.` kullanımını `LazyLoader.load('voice').then(...)` ile sar. `smart-suggestions.js` ~530 zaten guard'lı (yüklenmemişse sayıları kelimeye çevirmeden devam eder). Seslendirme panelini açan butonda yükleme yapıldığı için bu kabul edilebilir; istenirse orada da `await` eklenebilir.
- **app.html:** Etiketi kaldır.
- **Kullanıcı Test Listesi:** Seslendirme panelini aç, ses üret, dinle, videoya ekle.

**Faz 3 bitince:** Ölçüm + `CACHE_NAME` artır. Beklenen: eager JS'te ~2 MB azalma.

---

## 7. FAZ 4: Sıkı Bağlı Büyük Modülleri Boşta (Idle) Yükle

> **Neden on-demand değil:** 3D motorunun 469, TemplateBuilder'ın 175, PhotoStaging'in 121 dış referansı var ve autosave açılışta bunları çağırıyor. Hepsini proxy'lemek çok riskli. Bunun yerine **ilk boyama ve etkileşim hazır olduktan sonra** `requestIdleCallback` ile arka planda yüklenirler. Mevcut `if (window.ThreeDEngine)` guard'ları sayesinde yüklenene kadar kod sessizce atlar.

### [ ] F4.1: Idle yükleme altyapısı
- **Dosya:** `core/lazy-loader.js`
- **Ne:** `LazyLoader.preloadIdle(names[])`: `requestIdleCallback` (yoksa `setTimeout(…, 1500)`) ile paketleri sırayla, `showLoading:false` olarak yükler. `main.js` başlangıcının sonunda (ilk görsel/proje hazır olduktan sonra) çağrılır.

### [ ] F4.2: 3D motoru paketi
- **Paket `three-d`:** `[css/three-d.css, css/three-d-textures.css, modules/estate-3d-library.js, modules/three-d-engine.js, modules/three-d-textures.js, modules/three-d-align.js, modules/three-d-grouping.js, modules/three-d-export.js]` (**sıra korunmalı**), ready: `() => !!window.ThreeDEngine`.
- **Zorunlu düzeltmeler:**
  1. **Autosave geri yükleme:** `js/autoSave.js` (~1017) `state.threeDData` varsa önce `await window.LazyLoader.load('three-d', { showLoading:false })`, sonra `restoreData`. Fonksiyon async değilse yalnızca bu bloğu `LazyLoader.load(...).then(...)` ile sar.
  2. **Kullanıcı tetikleyicileri:** app.html'de `window.ThreeDEngine` kullanan `onclick`'ler `if(window.ThreeDEngine) ...` kalıbında. Yüklenmeden tıklanırsa sessizce hiçbir şey olmaz. Bunu önlemek için yardımcı ekle: `window.with3D = fn => LazyLoader.load('three-d', {label:'3D Stüdyo'}).then(() => fn(window.ThreeDEngine))`. **En azından** şu girişleri buna bağla: "3D Metin Ekle", 3D Düzlem/Stüdyo açma (`openStudio`), dock 3D butonu, `main.js` ~3083 `convert2DBadgeTo3D`, `modules/events.js` (~170, ~532), `modules/layers.js` (~491), `js/searchManager.js` 3D aracı, `modules/three-d-grouping.js` dışındaki estate kütüphanesi çağrıları.
  3. Diğer guard'lı referanslar (layers, empty-state, export, main.js ~1729 temizleme) yüklenmemişken atlanır; bu doğru davranış (sahnede 3D yok demektir).
- **app.html:** 3D script etiketlerini kaldır, `preloadIdle(['three-d', ...])` listesine ekle.
- **Risk:** 🔴 Yüksek. Tek seferde yapma; önce 1. ve 2. maddeleri uygula, `[T]` olarak işaretle, kullanıcı testi sonrası etiketleri kaldır.
- **Kullanıcı Test Listesi:** Sayfa açılır açılmaz (1-2 sn içinde) "3D Metin Ekle"ye bas; 3D'li projeyi kaydet → yenile → 3D geri geliyor mu; emlak 3D nesneleri, çit dönüştürme, GLB yükleme, 3D export, katmanlar panelinde 3D ögeler, sağ tık menüsü, Yeni Proje ile temizleme.

### [ ] F4.3: Şablon oluşturucu paketi
- **Paket `template-builder`:** `[css/template-builder.css, css/template-shapes.css, css/template-info-card.css, modules/template-shapes-data.js, modules/template-bg-data.js, modules/template-layouts-data.js, data/portfolio-presets.js, modules/template-info-card.js, modules/template-builder.js, modules/template-3d-frame.js, modules/template-polygon-frame.js, modules/portfolio-manager.js]`.
- **Ön inceleme:** `state.js` (12), `layers.js` (9), `core/drag.js` (5), `dock-manager.js` (3), `ui-core.js` (2) ve app.html'deki 93 kullanımın guard'lı olup olmadığını kontrol et. Guard'sız kullanım (ör. `TemplateBuilder.x()` doğrudan) varsa önce guard ekle. Autosave şablon durumunu geri yüklüyorsa F4.2'deki gibi `await` ekle. "Şablon Oluştur" sekme butonunu `LazyLoader.load('template-builder')` ile sar.
- **Risk:** 🔴 Yüksek. Ön inceleme sonucunu "Notlar"a yaz; guard'sız kullanım çoksa bu görevi `[!]` yapıp kullanıcıya danış.

### [ ] F4.4: Ağır veri kütüphaneleri (idle)
- `modules/callouts-library-extra.js` (223 KB), `modules/icon-library.js` (191 KB), `modules/photo-staging.js` (95 KB, sıkı bağlı) için aynı ön inceleme. Açılışta kullanılmıyor ve guard'lıysa idle listesine ekle.

**Faz 4 bitince:** Ölçüm + `CACHE_NAME` artır. Beklenen: eager JS ~3 MB altına.

---

## 8. FAZ 5: Minify / Build Adımı (⚠️ KULLANICI KARARI GEREKLİ)

### [!] F5.1: esbuild ile minify
- **Neden bekliyor:** Projenin nasıl yayınlandığı (GitHub Pages / Cloudflare Pages / manuel FTP) bu dosyayı yazan ajan tarafından bilinmiyor. Build çıktısı (`dist/`) deploy sürecini değiştirir. **Kullanıcıya sormadan başlama.**
- **Önerilen yaklaşım (onay gelirse):**
  - `npm i -D esbuild`, `scripts/build.mjs`: tüm yerel `.js` ve `.css` dosyalarını **bundle etmeden**, sadece `minify: true` ile `dist/` altına aynı klasör yapısında kopyala. HTML ve asset'leri olduğu gibi kopyala.
  - Global `window.X` kullanımı yaygın olduğu için `keepNames: true` kullan ve tree-shaking yapma.
  - Kazanç: JS ve CSS boyutunda %40-60.
  - Aynı build adımı `?v=` parametrelerini ve `sw.js` `CACHE_NAME` değerini tek bir build-id'den üretebilir; deploy kökünden `*.md`, `*.sql`, `archive/`, `scratch/`, `test_*` dosyalarını da dışlar (güvenlik raporu D1).
- **Alternatif:** Hosting Cloudflare ise Brotli sıkıştırma zaten aktif olabilir; minify'ın ek getirisini kullanıcı Lighthouse ile değerlendirebilir.

---

## 9. Ölçüm Kayıtları

| Tarih | Faz/Görev | Eager yerel JS (KB) | Blocking CSS (KB) | defer'siz script | CDN JS | CDN CSS | Not |
|---|---|---|---|---|---|---|---|
| 2026-10-03 | Başlangıç | 5.655 | 771 | 110 | 11 | 3 | Plan oluşturuldu |
| 2026-10-03 | Faz 1 Sonrası | 5.595 | 771 | 109 | 11 | 3 | CDN scriptleri body sonuna taşındı, sürümler sabitlendi, fontlar hafifletildi |
| 2026-10-03 | Faz 2 Sonrası | 5.595 | 233 | 109 | 11 | 3 | Modül CSS'leri non-blocking (media=print) yapıldı, blocking CSS %70 azaldı |
| 2026-10-03 | Faz 3 Sonrası | 4.688 | 233 | 95 | 5 | 2 | LazyLoader devrede: uydu, zip, pdf, qrcode, video, carousel, saber, voice paketleri on-demand yapıldı |

---

## 10. Görev Günlüğü (Her Ajan Kısa Kayıt Ekler)

| Tarih-Saat | Görev | Durum | Değişen dosyalar | Not |
|---|---|---|---|---|
| 2026-10-03 11:50 | Plan | ✅ | `docs/ACILIS_PERFORMANS_YOL_HARITASI.md` | Yol haritası oluşturuldu; kod değişikliği yok |
| 2026-10-03 12:10 | Güvenlik | ✅ | `supabase_schema.sql`, `admin.html`, `docs/GUVENLIK_VE_SISTEM_DURUMU.md` | profiles ve license_codes RLS politikaları kapatıldı, admin.html XSS sanitizasyonu yapıldı |
| 2026-10-03 12:20 | Faz 1 | ✅ | `app.html`, `index.html`, `admin.html`, `js/saber-animation.js`, `sw.js` | CDN scriptleri taşındı/sabitlendi, fontlar hafifletildi, helvetiker_bold kaldırıldı, sw cache v114 |
| 2026-10-03 12:25 | Faz 2 | ✅ | `app.html`, `sw.js` | Modül stilleri media=print onload ile non-blocking yapıldı (771 KB -> 233 KB), sw cache v115 |
| 2026-10-03 12:35 | Faz 3 | ✅ | `core/lazy-loader.js`, `modules/satellite-map.js`, `main.js`, `modules/empty-state.js`, `modules/carousel-manager.js`, `modules/photo-staging.js`, `modules/satellite-cadastre.js`, `js/modules/qrManager.js`, `app.html`, `sw.js` | LazyLoader ile 7 paket on-demand bağlandı, 6 CDN kütüphanesi açılıştan kaldırıldı, eager JS 967 KB düştü, sw cache v116 |
