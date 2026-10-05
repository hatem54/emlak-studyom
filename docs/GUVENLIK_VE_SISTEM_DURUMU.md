# Emlak Stüdyom - Güvenlik ve Sistem Durumu Envanteri

> **Son Güncelleme:** 3 Ekim 2026  
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
