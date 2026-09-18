# Emlak Stüdyom Proje Standartları & Kuralları

Bu dosya proje genelinde arayüz (UI), buton ve metin standartlarını kalıcı hale getirmek amacıyla oluşturulmuştur. Sonraki tüm adımlarda aşağıdaki kurallara istisnasız uyulmalıdır:

## 1. Buton & Etiketlerde Tek İkon Kuralı (Kesin Kural)
- **Çift İkon Kullanımı Yasaktır:** Bir butonda hem FontAwesome ikonu (`<i class="fa-solid ..."></i>`) hem de emoji (örn: `⚡`, `🤖`, `✨`, `📸`) **asla bir arada kullanılamaz**.
- Tercihen tek bir FontAwesome ikonu veya tek bir emoji kullanılmalıdır:
  - ✅ DOĞRU: `<i class="fa-solid fa-bolt"></i> Tümünü İndir`
  - ✅ DOĞRU: `📸 Toplu Görsel Seç`
  - ❌ YANLIŞ: `<i class="fa-solid fa-bolt"></i> ⚡ Tümünü Otomatik İndir`
  - ❌ YANLIŞ: `<i class="fa-solid fa-wand-magic-sparkles"></i> 🤖 Metni Süz`

## 2. Parantez İçi Açıklama Yasağı (Kesin Kural)
- Buton veya seçenek metinlerinin sonuna parantez içi yönlendirme veya açıklama **yazılmayacaktır**.
  - ❌ YANLIŞ: `Her Fotoğraf İçin Sor (Adım Adım Düzenle)`
  - ❌ YANLIŞ: `Neon Efektini Kaldır (Normal Çizim Yap)`
  - ❌ YANLIŞ: `Şablonu Gizle (Geçici)`
  - ❌ YANLIŞ: `Detaylı (+Çevre)`
  - ❌ YANLIŞ: `Açıları Sıfırla (0°)`
  - ✅ DOĞRU: `Adım Adım Düzenle`
  - ✅ DOĞRU: `Neon Efektini Kaldır`
  - ✅ DOĞRU: `Şablonu Gizle`
  - ✅ DOĞRU: `Detaylı`
  - ✅ DOĞRU: `Açıları Sıfırla`

## 3. Net, Kısa ve Eylem Odaklı Fiiller
- Buton isimleri laf kalabalığından arındırılmış, 1-3 kelimelik net eylemler olmalıdır.
  - "Bu Efekti 3 sn Video Olarak İndir" ➡️ **"Video İndir"**
  - "Tüm Neon Çizimlerini Temizle" ➡️ **"Çizimleri Temizle"**
  - "Bu Ayarları Hazır Ayar Olarak Kaydet" ➡️ **"Hazır Ayar Kaydet"**
  - "Öncesi / Sonrası Karşılaştır" ➡️ **"Öncesi / Sonrası"**
  - "İndir & Sıradakine Geç" ➡️ **"İndir ve İlerle"**

## 4. Açıklamalar İçin Tooltip Kullanımı
- Kullanıcıya rehberlik edecek uzun açıklamalar buton metninin içine değil, butonun `title="..."` özniteliğine veya popover/tooltip mekanizmasına yazılmalıdır.
