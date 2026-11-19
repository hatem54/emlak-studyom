# Emlak Stüdyom - Güvenlik ve Sistem Durumu Envanteri

> **Son Güncelleme:** 11 Kasım 2026 (Yayın öncesi denetim ve düzeltmeler: Bölüm 4)  
> **Amaç:** Bu belge, geçmiş sohbetlerde **zaten yapılmış olan güvenlik önlemlerini** ve **hâlâ yapılması gereken eksikleri** net olarak ayırır. Her yeni yapay zeka ajanı veya geliştirici, daha önce yapılmış işleri tekrar sormamak ve sıfırdan incelememek için **önce bu belgeye bakmalıdır.**

---

## 1. ✅ DAHA ÖNCE YAPILANLAR (TAMAMLANMIŞ VE DEVREDE OLANLAR)

Bu maddeler daha önce çözülmüştür, kodda veya harici panellerde aktiftir; tekrar sıfırdan araştırılması gerekmez:

### 1.1. Google Cloud / Maps API Anahtarı Domain Kısıtlaması
- **Durum:** ✅ Tamamlandı.
- **Açıklama:** `config.js` ve uydu modüllerinde yer alan Google anahtarı (`AIzaSy...`) Google Cloud Console üzerinden **HTTP Referrer (Websites)** kısıtlamasına bağlanmıştır.
- **İzin Verilen Domainler:**
  - `https://emlakstudyom.com/*`
  - `https://*.emlakstudyom.com/*`
  - `http://localhost:5500/*` ve `http://127.0.0.1:*/*`
- **Sonuç:** Anahtar istemci kodunda (JS içinde) bulunmak zorundadır (Google Maps JS API istemcide çalışır). Ancak başka bir web sitesi veya kişi bu anahtarı çalıp kendi sitesinde ya da harici sunucusunda kullanamaz; Google 403 Forbidden döner.

### 1.2. Cloudflare Worker ile Gemini API Anahtarının Gizlenmesi
- **Durum:** ✅ Tamamlandı.
- **Worker Adresi:** `https://small-lab-3110.emlakstudyomtr.workers.dev`
- **Açıklama:** İstemci tarafında (`app.html`, `main.js`, `ai-assistant.js` vb.) hiçbir açık Google Gemini API anahtarı bırakılmamıştır. Tüm AI ve OCR çağrıları bu Worker üzerinden aktarılır.
- **Güvenlik Başlığı:** İsteklerde `X-Emlak-Client: emlak-studyom-core-v7` başlığı kontrol edilir; dışarıdan direkt bot/curl istekleri engellenmiştir.

### 1.3. İstemci Tarafı Sahte Pro / Admin Bypass Hilelerinin Temizlenmesi
- **Durum:** ✅ Tamamlandı.
- **Açıklama:** Önceden tarayıcı konsolundan `localStorage.setItem('emlak_admin_bypass', 'true')` yazılarak açılabilen kontroller temizlenmiş; yetkilendirme Supabase oturumuna bağlanmıştır.

### 1.4. Müşteri Fotoğraflarının Sunucuya Yüklenmemesi (Sıfır Sunucu Yükü / KVKK)
- **Durum:** ✅ Tamamlandı.
- **Açıklama:** Fotoğraf düzenleme, yapay zeka netleştirme, silgi, 3D ve export tamamen tarayıcının kendi tuvalinde (Canvas / WebGL) işlenir. Müşteri görselleri sunucuya yüklenmediği için veri sızıntısı riski yoktur.

### 1.5. Admin Paneli XSS Kalkanı (HTML Escape)
- **Durum:** ✅ Tamamlandı.
- **Dosya:** `admin.html`
- **Açıklama:** Kullanıcı adları, e-postalar, lisans notları ve geri bildirim mesajları ekrana basılırken `escapeHtml()` fonksiyonundan geçirilerek zararlı HTML/script enjeksiyonu riski tamamen sıfırlanmıştır.

### 1.6. Supabase RLS ve Rol Koruma SQL Kalkanı
- **Durum:** ✅ Dosya güncellendi (`supabase_schema.sql`).
- **Açıklama:** `is_admin()` fonksiyonu eklenerek sonsuz özyineleme riski kaldırılmış; kullanıcıların aktif lisans kodlarını listeleyebilmesi engellenmiş ve `protect_profile_roles` trigger'ı ile kullanıcıların kendi rollerini admin yapması engellenmiştir. Kullanıcının Supabase SQL Editor'de bir kez çalıştırması yeterlidir.

### 1.7. Merkezi Giriş ve Dosya Güvenlik Kalkanı (SecurityGuard)
- **Durum:** ✅ Tamamlandı.
- **Dosyalar:** `modules/security-guard.js`, `app.html`, `modules/satellite-cadastre.js`, `modules/export.js`, `modules/three-d-engine.js`, `modules/parser-core.js`, `main.js`
- **Açıklama:** Uygulamaya giren tüm veri kanalları (dosya yüklemeleri, sürükle-bırak, pano yapıştırma, KML/KMZ, JSON şablonları, 3D modeller ve OCR) koruma altına alınmıştır:
  - **XSS & XXE Koruması:** DOMPurify destekli HTML arındırma (`sanitizeHtml`), KML popup güvenliği (`escapeHtml`), XXE XML entity engeli (`validateKmlText`) ve ID arındırma (`sanitizeId`).
  - **Zararlı Uzantı & Sahtecilik Engeli:** `.exe`, `.bat`, `.cmd`, `.sh`, `.php`, `.js` vb. tüm çalıştırılabilir dosyalar engellenmiştir.
  - **Piksel Bombası & Dekompresyon Koruması:** Aşırı yüksek çözünürlüklü (8K+ / 40MP+) ve sahte/bozuk görseller decode probe ile engellenir.
  - **Hata Yakalama & Donma Önleme:** 3D GLTF yükleyicisi ve FileReader okuyucularına `onerror` korumaları eklenmiş; bekleme ekranının (`hideAppLoading`) donup kalması önlenmiştir.

---

## 2. ⚠️ HÂLÂ YAPILMASI GEREKENLER

### 2.1. 🟠 Ortak Bilgisayarda Verilerin Karışması (Emlak Ofisi Senaryosu)
- **Dosyalar:** `js/autoSave.js`, `js/brandManager.js`, `modules/ai-assistant.js`
- **Sorun:** Çıkış yapıldığında yerel depolamadaki son proje, marka logosu ve kişisel AI anahtarı silinmemektedir.
- **Yapılacak Düzeltme:** Yerel kayıt anahtarları kullanıcı ID'si ile ayrılmalı (`es:<uid>:latest_save`) ve çıkışta temizlenmelidir.

---

## 3. 🎯 HIZLI KARAR VE ÖNCELİK REHBERİ

1. **"Google anahtarımız çalınır mı?"** ➡️ Hayır, Google Cloud Console'da referrer kısıtlaması zaten yapılmıştır. Sadece kendi alan adınızda çalışır.
2. **"Gemini anahtarımız açıkta mı?"** ➡️ Hayır, Cloudflare Worker arkasında gizlenmiştir.
3. **"İlk neye müdahale edilmeli?"** ➡️ `supabase_schema.sql` RLS düzeltmesi (Madde 2.1 ve 2.2) ve `admin.html` XSS düzeltmesi (Madde 2.3).
4. **"Açılış hızı için neye bakılmalı?"** ➡️ `docs/ACILIS_PERFORMANS_YOL_HARITASI.md` belgesindeki Faz 1'den başlanmalıdır.

---

## 4. 🔎 YAYIN ÖNCESİ DENETİM (11 Kasım 2026)

> **Kapsam:** Güvenlik, çok kullanıcılı kullanımda donma/kasma, dış servis limitleri, veri kaybı, KVKK.
> **Yöntem:** Kod okuma ve statik analiz. Önceki raporların (`PRODUCTION_AUDIT_REPORT.md`, `REKLAM_ONCESI_SON_KONTROL.md`) iddiaları kodla tek tek karşılaştırıldı.
> **Düzeltme ilerlemesi:** [YAYIN_ONCESI_DUZELTMELER.md](YAYIN_ONCESI_DUZELTMELER.md) (hangi madde yapıldı, hangisi bekliyor).
> **Son durum (12 Kasım 2026, 07:49):** Kod gerektiren tüm maddeler, Supabase SQL sertleştirmesi (4.6), Resend SMTP e-posta entegrasyonu (Ready to send) ve 12 adet test görselinin temizlenmesi (4.8) başarıyla tamamlandı.

### 4.1. Bu Denetimde Bakılan Alanlar (sonraki taramada tekrar bakılmasına gerek yok, sadece değişen dosyalar)
| Alan | Bakılan dosyalar | Sonuç |
|---|---|---|
| İstemcideki anahtarlar | `config.js`, `modules/ai-assistant.js`, `satellite-core.js`, `voiceover-studio.js` | `service_role` yok ✓. Harita anahtarı TTS için de kullanılıyordu |
| Supabase RLS | `supabase_schema.sql`, `js/subscription.js`, `js/mode-manager.js` | `profiles`, `license_codes` doğru ✓. `feedback` şemada yok, `error_logs` herkese açık yazma |
| Admin XSS | `admin.html` | Tüm alanlar `escapeHtml` ile basılıyor ✓ |
| Proje/taslak içe aktarma | `modules/export.js:3662`, `js/autoSave.js`, `modules/state.js` | DOMPurify var ✓; autoSave'de zayıf regex temizleyici |
| CDN betikleri | `app.html`, `index.html`, `admin.html` | 11 CDN, hiçbirinde SRI yok |
| Herkese açık dosyalar ve başlıklar | kök dizin, `robots.txt` | `_headers` yok, `docs/`, `archive/`, `*.sql` yayında |
| Service Worker | `sw.js`, `ui/pwa-install.js` | Network-first ✓; `skipWaiting` karışık sürüm riski |
| Dış servisler | Nominatim, Gemini Worker, Google 3D Tiles/TTS, Supabase SMTP/Realtime | Limitler Kapasite tablosunda |
| Açılış yükü | `app.html` | 104 yerel JS (5,8 MB) + 11 CDN, neredeyse tamamı bloklayıcı |
| Bellek / donma | `modules/state.js`, `template-builder.js`, `js/autoSave.js`, `tpl_kolaj/kolaj.js` | Çerçeve fotoğrafları ham dataURL + 40 adım geri al kopyası |
| Veri kaybı | `js/autoSave.js` | Şablon çerçeveleri (`tb-image-frame`) autoSave'de yok; çizim imzası sadece adet |
| KVKK | `gizlilik.html`, `js/auth.js` | Servisler/yurt dışı aktarım yazmıyor, kayıt onayı yok |

### 4.2. Kodla Çözülemeyen, Panelden Yapılacaklar (kullanıcı kontrol edecek)
- [x] Supabase feedback tablosu oluşturuldu ve RLS açıldı (4.6 SQL çalıştırıldı)
- [x] Supabase özel SMTP (Resend entegrasyonu tamamlandı, emlakstudyom.com DKIM/SPF/DMARC aktif, Ready to send)
- [x] Google Cloud: Ödeme yöntemi tanımlı değil (tamamen ücretsiz katmanda); uygulama içi otomatik fallback sayesinde kota dolunca kesintisiz ücretsiz Standart ses motoruna geçiş aktif
- [ ] Gemini anahtarı ücretli katmanda mı (ücretsizde dakikada ~10-15 istek)
- [ ] Cloudflare Worker: IP rate limit + Origin kontrolü
- [ ] GitHub deposu private mi

### 4.3. Bilinçli Olarak Ertelenen / Geri Çekilen Öneriler
- **Uydu modüllerini ve `heic2any`'yi gecikmeli yükleme:** 3 Ekim rollback geçmişi nedeniyle (bkz. `ACILIS_PERFORMANS_YOL_HARITASI.md` 3.1) acil listeden çıkarıldı.
- **Pro/filigran kontrolünü sunucuya taşıma, lisans kodu güçlendirme, Esri lisansı, mesafeli satış/ETBİS, çerez bandı:** Ücretli plana geçmeden önce yapılacak.

### 4.4. Sonraki Taramada Bakılacaklar
- `YAYIN_ONCESI_DUZELTMELER.md` içindeki `✅` maddelerin canlıda doğrulanması (kullanıcı testi).
- 4.2'deki panel maddelerinin sonucu.
- Yeni eklenen modüllerde: global `mousemove` dinleyicisi, ham dataURL saklama, `innerHTML` ile temizlenmemiş veri.

