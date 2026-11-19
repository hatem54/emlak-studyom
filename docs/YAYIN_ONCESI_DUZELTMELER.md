# Yayın Öncesi Düzeltmeler: İlerleme Kaydı

> **Başlangıç:** 11 Kasım 2026, 13:25
> **Kaynak rapor:** Yayın öncesi denetim raporu (11 Kasım 2026). Özet ve tüm bulgular [GUVENLIK_VE_SISTEM_DURUMU.md](GUVENLIK_VE_SISTEM_DURUMU.md) dosyasının "4. Yayın Öncesi Denetim" bölümünde.
> **Bu dosyanın amacı:** Hangi düzeltmenin yapıldığını, hangisinin beklediğini adım adım kaydetmek. Kota biterse veya yeni bir ajan devralırsa buradan devam edilir.

## Devralan Ajan İçin
1. Önce bu tabloya bak. `⏳` olan ilk maddeden devam et.
2. Her maddeyi bitirince: `node -c` ile sentaks kontrolü yap, tabloyu `✅` yap, "Yapılanlar" bölümüne kısa not ekle.
3. Kullanıcı kararı gereken maddeleri `🟨` yap ve sebebini yaz; atlayıp sonrakine geç.
4. Kural hatırlatma: Git komutu yok, kullanıcı izni olmadan dosya silme yok, uygulama içi test yok (kullanıcı test eder).

## Durum Tablosu

| # | İş | Durum | Dosyalar |
|---|---|---|---|
| 4.1 | Ziyaretçi sayacı e-postaları yayınlıyor | ✅ | `js/presence.js` |
| 4.2 | Kolaj fotoğrafları küçültülmüyor, geri al belleği şişiyor | ✅ | `modules/template-builder.js`, `modules/state.js` |
| 4.3 | Şablon çerçeveleri otomatik kayda girmiyor | ✅ | `js/autoSave.js` |
| 4.4 | Seslendirme herkese açık harita anahtarını kullanıyor | ✅ | `modules/voiceover-studio.js` |
| 4.5 | Gizlilik metni ve kayıt onayı | ✅ | `gizlilik.html`, `index.html` |
| 4.6 | Hata kayıt tablosu kötüye kullanılabilir | ✅ | `supabase_schema.sql` (Bölüm 8) |
| 4.7 | Admin panelinde geri bildirimler "Anonim" | ✅ | `admin.html` |
| 4.8 | Gereksiz dosyalar sitede açık | ✅ | 12 test görseli silindi, `_redirects` aktif |
| 4.9 | Güvenlik başlıkları yok | ✅ (Cloudflare Pages / Netlify ise) | `_headers` |
| 4.10 | Adres aramada art arda istek | ✅ | `modules/satellite-core.js` |
| 4.11 | Çizim düzenlemeleri otomatik kayda yansımıyor | ✅ | `js/autoSave.js` |
| 4.12 | CDN kütüphanelerinde bütünlük kontrolü yok | ✅ (pixi-filters hariç) | `app.html`, `index.html`, `admin.html` |
| 2.1 | Çıkışta kişisel anahtarların temizlenmesi (yarım kalan) | ✅ | `js/mode-manager.js` |

## Yapılanlar (her madde bitince eklenir)

### ✅ 4.1 Ziyaretçi sayacı (13:26)
- **Ne değişti:** `js/presence.js` artık kanala e-posta ve gerçek kullanıcı kimliği (UUID) göndermiyor. Her sekme rastgele anonim bir anahtarla (`v_xxxx`) katılıyor; sadece `page`, `device`, `online_at` yayınlanıyor.
- **Admin paneli etkisi:** Yok. Panel zaten sadece sayıları (`total`, `app`, `index`, `mobile`, `desktop`) kullanıyordu.
- **Sürüm:** `app.html`, `index.html`, `admin.html` içinde `presence.js?v=20261111-1`.
- **Kalan konu:** Supabase Free planda 200 eşzamanlı Realtime bağlantı sınırı hâlâ geçerli (vitrin sayfası da bağlanıyor). Vitrin sayacını kapatmak admin panelindeki "Vitrin" sayısını sıfırlayacağı için kullanıcıya sorulmadan yapılmadı.
- **Kullanıcı testi:** Admin panelini ve başka bir sekmede uygulamayı açın; "Canlı Kullanıcı" sayısı artıyor mu?

### ✅ 4.2 Kolaj fotoğraf belleği (13:29)
- **Ne değişti (1): Fotoğraf küçültme** `modules/template-builder.js`
  - Yeni `_optimizeFrameImageSrc()`: çerçeveye konan fotoğrafın uzun kenarı 3200 px'ten büyükse küçültülüyor. Fotoğraf PNG/WEBP/GIF ise şeffaflık korunsun diye PNG, değilse JPEG %92 kalite.
  - Sadece dosyalar ve 3,5 MB'tan büyük `data:` metinleri işleniyor. Uzak (http) görseller ve küçük görseller eskisi gibi anında uygulanıyor.
  - Bir kez optimize edilen görsel tekrar sıkıştırılmıyor (`_optimizedFrameSrcKeys`); geri al/ileri al sırasında kalite kaybı olmaz.
  - Geri yükleme sırasında (`isHistoryRestoring`) çağrılırsa yeni geçmiş adımı yazılmıyor (ileri al geçmişi bozulmasın diye).
  - FileReader'a hata yakalayıcı eklendi.
- **Ne değişti (2): Geri al karşılaştırması** `modules/state.js`
  - `recordHistory` her işlemde önceki ve yeni durumu karşılaştırırken büyük metinleri (fotoğraflar, dev HTML) artık tamamen seri hale getirmiyor; uzunluk + 3 örnek parçadan oluşan kısa bir parmak izi (`_historySig`) kullanıyor. Her tıklamadaki onlarca MB'lık işlem kalktı.
- **Düzeltme notu (rapordaki tahmin):** Raporda "40 adımda 40 kopya" demiştim. Chrome aynı DOM özniteliğinden okunan metni çoğu durumda bellekte paylaşır; gerçek bellek artışı muhtemelen bundan az. Asıl ölçülebilir maliyet her işlemdeki büyük `JSON.stringify` idi; o giderildi. Fotoğraf boyutunun 5-7 kat küçülmesi otomatik kayıt ve dışa aktarmayı da hafifletir.
- **Sürüm:** `state.js?v=20261111-1`, `template-builder.js?v=20261111-1`.
- **Kullanıcı testi:** Şablon Düzenle'de 4-6 çerçeveye büyük telefon fotoğrafları koyun; fotoğraflar net mi, sürükleme/geri al akıcı mı? Şeffaf PNG logo koyunca arka plan şeffaf kalıyor mu?

### ✅ 4.3 Şablon çerçevelerinin otomatik kaydı (13:31)
- **Ek bulgu (rapordakinden kötüydü):** Çerçeveler kayda hiç girmemek bir yana, **yanlış** giriyordu. `autoSave.js` içindeki "B. Metinler" döngüsü `#ui-layer .canvas-el.draggable` seçicisiyle çerçeveleri de yakalıyor ve **metin kutusu** olarak kaydediyordu. Geri yüklemede içinde "Fotoğraf Ekle / Tıkla veya Sürükle Bırak" yazan bozuk yazı kutuları çıkardı; fotoğraf, zoom, 3D ayarları kayboluyordu.
- **Ne değişti:** `js/autoSave.js`
  1. Metin döngüsü artık `.tb-image-frame` ögelerini atlıyor.
  2. Yeni `state.tbFrames`: geri al sisteminin kullandığı `captureTemplateFrames()` (modules/state.js) ile aynı formatta kaydediliyor. Fotoğraf tek kopya tutuluyor (`dataset.imgSrc` kopyası çıkarıldı).
  3. Kayıt imzasına `tbf` eklendi: çerçeve taşındığında/fotoğraf değiştiğinde kayıt atlanmıyor.
  4. Geri yüklemede (6.3) çerçeveler `TemplateBuilder.restoreFrameFromSnapshot()` ile kuruluyor; her çerçeve ayrı `try/catch` içinde (biri bozuksa diğerleri yine gelir).
- **Eski kayıtlar:** Bu güncellemeden önce alınmış taslaklarda `tbFrames` yok; onlar eskisi gibi yüklenir (bozuk metin kutusu sorunu eski kayıtlarda devam edebilir, yeni kayıtlarda olmaz).
- **Sürüm:** `autoSave.js?v=20261111-1`.
- **Kullanıcı testi:** Şablon Düzenle'de 2 çerçeveye fotoğraf koyun (birini yuvarlak/3D yapın) → 10 sn bekleyin → sekmeyi kapatıp açın → Proje Geçmişi'nden geri yükleyin. Çerçeveler fotoğraf ve 3D ayarlarıyla geliyor mu?

### ✅ 4.4 Seslendirme anahtarı (13:33)
- **Ne değişti:** `modules/voiceover-studio.js` → `getGoogleApiKey()` artık sayfa kaynağındaki harita anahtarına (`GOOGLE_MAPS_3D_KEY`) düşmüyor. Sırası: kullanıcının kendi Gemini/Google anahtarı → admin'in özel TTS anahtarı (`emlak_tts_api_key`) → yoksa boş.
- **Davranış:** Anahtar yoksa nöral ses isteği hata verir ve uygulama **zaten var olan** yedek akışla otomatik olarak Standart TTS motoruna geçer (kullanıcıya sarı bilgi satırı gösterilir). Çökme yok.
- **⚠️ Görünür değişiklik:** Önceden herkes "Wavenet" seslerini sizin harita anahtarınızla (sizin faturanıza) kullanabiliyordu. Artık kendi anahtarı olmayan kullanıcılar standart sesi duyar.
- **Admin olarak nöral sesleri kullanmaya devam etmek için:** Google Cloud'da **sadece Text-to-Speech'e izinli** ayrı bir anahtar oluşturun → Seslendirme panelindeki admin anahtar penceresine yapıştırın. Bu anahtar sadece sizin tarayıcınızda durur, sayfa kaynağında görünmez.
- **Panel adımı (kullanıcı):** Artık harita anahtarındaki Text-to-Speech iznini kaldırabilirsiniz (Bölüm 3.3).
- Admin anahtar penceresindeki "varsayılan sistem anahtarı" metinleri güncellendi.
- **Sürüm:** `voiceover-studio.js?v=20261111-1`.

### ✅ 4.5 Gizlilik metni ve kayıt onayı (13:35)
- **`gizlilik.html` eklenenler:**
  - Bölüm 2'ye: yapay zekaya gönderilen metinler, teknik hata kayıtları (e-posta, tarayıcı, ekran, URL), tarayıcıda saklanan veriler.
  - Bölüm 4 düzeltildi: Eski metin "hiçbir üçüncü tarafla paylaşılmaz" diyordu, oysa veriler Supabase/Cloudflare/Google'a gidiyor (çelişki). Artık "satılmaz, sadece zorunlu altyapı sağlayıcılarıyla paylaşılır".
  - Yeni 5: Hizmet sağlayıcılar ve yurt dışına aktarım (Supabase, Cloudflare, Google, OpenStreetMap, Esri).
  - Yeni 6: Çerezler ve yerel depolama (reklam çerezi yok; eklenirse önce izin alınacak).
  - Yeni 8: KVKK madde 11 hakları ve başvuru yolu (e-posta, 30 gün).
  - Yeni 9: Veri sorumlusu.
  - Tarih 11 Kasım 2026.
- **`index.html` kayıt formu:** "Ücretsiz Başla" butonunun altına Kullanım Şartları ve Gizlilik/Aydınlatma Metni bağlantılı onay ibaresi eklendi.
- **⚠️ Kullanıcının yapması gereken:**
  1. `gizlilik.html` Bölüm 9'a gerçek adınızı/şirket unvanınızı ve yazışma adresinizi ekleyin (dosyada `YAPILACAK` yorumu var). KVKK aydınlatma metninde veri sorumlusunun kimliği zorunlu.
  2. Metni bir avukata kontrol ettirin.
  3. Metin "hata kayıtları en fazla 90 gün saklanır" diyor; bu, 4.6'daki SQL'in Supabase'de çalıştırılmasıyla gerçek olur.

### ✅ 4.6 Hata kayıt tablosu ve geri bildirim tablosu (15:01): Supabase'de başarıyla çalıştırıldı
- **Sonuç:** Kullanıcı SQL'i Supabase SQL Editor'de başarıyla çalıştırdı ("Success").
- **Kazanımlar:**
  - `error_logs` tablosuna kötüye kullanım ve sel koruması (`error_logs_guard`) bağlandı; 90 günden eski kayıtlar otomatik temizlenecek.
  - `feedback` tablosu oluşturuldu ve RLS açıldı: ziyaretçiler geri bildirim gönderebilir, sadece admin okuyabilir.
  - `protect_profile_roles` tetikleyicisi ve `is_admin` fonksiyonları güvenli `search_path` ile aktif hale getirildi; rol ve abonelik sahteciliği kilitlendi.

### ✅ 4.7 Admin geri bildirim "Anonim" hatası (13:36)
- **Ne değişti:** `admin.html` geri bildirim tablosu artık `f.user_email` alanını okuyor (eski kayıtlar için `f.email` yedek). Yıldız sayısı 0-5 arasına sabitlendi; çok büyük bir puan değeri admin panelini dondurmaz.
- `admin.html` içindeki satır içi betik `node -c` ile kontrol edildi.
- **Kullanıcı testi:** Vitrinden bir geri bildirim gönderin, admin panelinde e-postanızla görünüyor mu?

### ✅ 4.8 Gereksiz dosyalar (12 Kasım 2026, 07:49): Test görselleri silindi, yönlendirmeler aktif
- **Silinen dosyalar:** Kullanıcının açık onayıyla kök dizindeki 12 adet test/debug görseli (`crop_debug.png`, `edges_debug.png`, `frame_crop.png`, `left_gap_crop.png`, `monitor_crop.png`, `quad_bot_left.png`, `quad_bot_right.png`, `quad_top_left.png`, `quad_top_right.png`, `shadow_vis.png`, `test_blur_shadow.png`, `white_mask.png`) silindi. `favicon.png` korundu.
- **`_redirects` (aktif):** `docs/`, `archive/`, `assets_backup/`, `supabase_schema.sql` ve `.md` dosyalarına doğrudan erişim engelli (ana sayfaya yönlendirilir).
- **`.gitignore`:** Korumalar güncel.

### ✅ 4.9 Güvenlik başlıkları (13:38)
- **`_headers` (yeni):** Tüm sayfalar için `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`. `admin.html` için ek olarak `X-Frame-Options: DENY`, `noindex`, `Cache-Control: no-store`.
- Uygulamanın kendi sayfalarını iframe ile açmadığı tarandı (bozulma riski yok).
- **CSP eklenmedi:** 11 CDN ve 500+ satır içi `onclick` nedeniyle zorunlu CSP uygulamayı bozar. Yayından sonra `Content-Security-Policy-Report-Only` ile denenmeli.
- **Koşul:** Cloudflare Pages veya Netlify'da çalışır. GitHub Pages'te başlık ayarlanamaz; o durumda alan adını Cloudflare (ücretsiz) arkasına almak gerekir.
- **Kullanıcı testi (yayından sonra):** Tarayıcıda F12 → Network → sayfayı yenileyin → `app.html` isteğine tıklayın → Response Headers'da `x-frame-options` görünüyor mu?

### ✅ 4.10 Adres arama (Nominatim) gecikmesi (13:38)
- **Ne değişti:** `modules/satellite-core.js` adres arama döngüsü artık her Nominatim isteği arasında en az 1,1 saniye bekliyor (`SatelliteMapModule._lastNominatimAt`). 429 (istek sınırı) dönerse kalan adaylar denenmiyor.
- **Yan etki:** Bulunamayan bir adres için birkaç aday deneniyorsa arama birkaç saniye uzayabilir. Bulunan aramalar genelde ilk adayda biter, fark hissedilmez.
- **Sürüm:** `satellite-core.js?v=20261111-1`.
- **Uzun vadeli öneri:** Yoğun kullanımda Google Geocoding API'ye geçmek.

### ✅ 4.11 Çizim düzenlemelerinin otomatik kayda yansıması (13:39)
- **Ne değişti:** `js/autoSave.js` kayıt imzasında çizimler için artık sadece adet (`length`) değil, içerik (noktalar, renk, kalınlık, konum, neon ayarları) kullanılıyor. DOM/Pixi referansları (`el`, `saberRef`, `graphics` vb.) imzadan çıkarılıyor; çok büyük metinler kısaltılıyor.
- **Sonuç:** Var olan bir çizimi taşıdığınızda, noktalarını düzenlediğinizde veya rengini değiştirdiğinizde bir sonraki otomatik kayıtta (5 sn içinde) kaydedilir.
- **Sürüm:** `autoSave.js?v=20261111-2`.
- **Kullanıcı testi:** Bir çizim yapın → 10 sn bekleyin → çizimi taşıyın/rengini değiştirin → 10 sn bekleyin → sayfayı yenileyip Proje Geçmişi'nden geri yükleyin. Çizim son halinde mi?

### ✅ 4.12 CDN bütünlük kontrolü / SRI (13:40)
- **Ne yapıldı:** Her CDN dosyası indirilip SHA-384 parmak izi hesaplandı ve etiketlere `integrity="sha384-..." crossorigin="anonymous"` eklendi: `app.html` 12, `index.html` 3, `admin.html` 3 etiket. Tüm CDN'lerin CORS izni (`Access-Control-Allow-Origin: *`) doğrulandı.
- **Supabase adresi değişti:** `supabase.min.js` jsDelivr'in kendi ürettiği bir dosyaydı (jsDelivr küçültücüsü güncellenirse içeriği ve parmak izi değişir, uygulama açılmaz). Paketteki asıl dosya `dist/umd/supabase.js` kullanıldı; içerik aynı (zaten küçültülmüş, 213 KB).
- **Bilerek SRI eklenmeyen:** `pixi-filters.min.js`. Bu dosya da jsDelivr tarafından üretiliyor, pakette küçültülmüş hali yok. SRI eklenirse ileride kendiliğinden kırılabilir. Kalıcı çözüm: dosyayı `assets/vendor/` altına indirmek.
- **Google Fonts:** İçeriği tarayıcıya göre değiştiği için SRI eklenemez (normal).
- **⚠️ Kural:** Bir CDN kütüphanesinin sürümünü değiştiren kişi `integrity` değerini de yeniden hesaplamalı; yoksa o kütüphane yüklenmez. Hesaplama: `Invoke-WebRequest <url>` → SHA384 → Base64.
- **Kullanıcı testi:** Uygulamayı, vitrini ve admin panelini açın. F12 → Console'da kırmızı "integrity" veya "Failed to find a valid digest" hatası olmamalı; giriş, uyarı pencereleri, ikonlar normal görünmeli.

### ✅ 2.1 Çıkışta kişisel anahtarların temizlenmesi (13:41)
- **Ne değişti:** `js/mode-manager.js` → `handleLogout()` artık `emlakstudiom_gemini_api_key`, `GOOGLE_MAPS_3D_KEY`, `emlak_tts_api_key` değerlerini de siliyor (taslak silme zaten vardı).
- **Etki:** Kendi anahtarını giren kullanıcı (veya admin) çıkış yapıp tekrar girince anahtarı yeniden girmesi gerekir. Ortak ofis bilgisayarında bir sonraki kişi anahtarı kullanamaz.
- **Sürüm:** `mode-manager.js?v=20261111-1`.

---

## Oturum Kapanışı (11 Kasım 2026, 13:41)

### Ek İyileştirmeler (12 Kasım 2026, 08:08)
- **7.3 Mobilde Uydu Haritası Bilgilendirmesi:** `modules/satellite-map.js` ve `modules/satellite-core.js` güncellendi; mobilde butona basıldığında sessiz kalmak yerine `"ℹ️ Uydu ve kadastro haritası bilgisayar veya tablette kullanılabilir."` uyarısı gösteriliyor.
- **7.1 / 7.2 iPhone `heic2any` Açılış Yükü İyileştirmesi:** `app.html` `<head>` içindeki 1.3 MB'lık senkron bloklayıcı `heic2any.min.js` kaldırıldı. `core/utils.js` içinde `ensureHeic2anyLoaded` fonksiyonu kurularak kütüphanenin sayfa açıldıktan sonra rölantide (idle) veya ilk HEIC fotoğrafı yüklendiği anda (on-demand) asenkron yüklenmesi sağlandı. Açılış anında 1.3 MB hafifleme sağlandı.
- **Service Worker:** `emlak-studiom-v306-20261112-heic-idle-perf`.

### Kalite kapısı
- `node -c` hatasız: `js/presence.js`, `modules/template-builder.js`, `modules/state.js`, `js/autoSave.js`, `modules/voiceover-studio.js`, `modules/satellite-core.js`, `js/mode-manager.js`, `sw.js`, `admin.html` ve `index.html` satır içi betikleri.
- Service Worker önbellek sürümü: `emlak-studiom-v305-20261111-prelaunch-fixes`.
- Uygulama içi test yapılmadı (proje kuralı 4.4); her maddenin altında kullanıcı test adımı var.

### Özet
- **✅ Kodda bitti (11):** 4.1, 4.2, 4.3, 4.4, 4.5, 4.7, 4.9, 4.10, 4.11, 4.12, 2.1
- **🟨 Kullanıcı adımı bekliyor (2):**
  - 4.6: `supabase_schema.sql` Bölüm 8'i Supabase SQL Editor'de çalıştırın.
  - 4.8: Debug PNG'ler ve `assets_backup/` için silme kararı (erişim zaten engellendi).
- **Kullanıcının ayrıca yapacakları:** `gizlilik.html` Bölüm 9'a gerçek ad/unvan ve adres; panel kontrolleri (`GUVENLIK_VE_SISTEM_DURUMU.md` 4.2: SMTP, Google kota/API kısıtı, Gemini katmanı, Worker rate limit, GitHub private).

### Değişen dosyalar
`js/presence.js`, `modules/template-builder.js`, `modules/state.js`, `js/autoSave.js`, `modules/voiceover-studio.js`, `modules/satellite-core.js`, `js/mode-manager.js`, `admin.html`, `index.html`, `app.html` (sürüm numaraları + SRI), `gizlilik.html`, `supabase_schema.sql`, `sw.js`, `.gitignore`. Yeni: `_headers`, `_redirects`, `docs/YAYIN_ONCESI_DUZELTMELER.md`.

### Sonraki ajan için
- Kullanıcı testlerinden hata gelirse ilgili maddenin "Ne değişti" notundan başla.
- 4.2 ve 4.3 en çok kod değişen maddeler; şablon çerçevesi, geri al ve taslak kurtarmada sorun bildirilirse önce bunlara bak.
- Ertelenen işler: `GUVENLIK_VE_SISTEM_DURUMU.md` 4.3 (ücretli plana geçmeden önce yapılacaklar).
