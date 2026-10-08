# Emlak Stüdyom Proje Standartları, Mimari & Yapay Zeka Kuralları

Bu dosya, Antigravity ve yapay zeka ajanlarının her işlemde istisnasız uyması gereken temel proje, mimari, arayüz ve otonom çalışma kurallarını tanımlar. Projenin mevcut güvenlik durumu ve tamamlanan işlerin kesin envanteri için [docs/GUVENLIK_VE_SISTEM_DURUMU.md](file:///c:/Users/Hatemi/Desktop/emlak%20d%C3%BCzenlemeleri%20i%C3%A7in%20uygulama/emlak-studiom%20v7-0/docs/GUVENLIK_VE_SISTEM_DURUMU.md); açılış performansı iyileştirme adımları ve devir kaydı için [docs/ACILIS_PERFORMANS_YOL_HARITASI.md](file:///c:/Users/Hatemi/Desktop/emlak%20d%C3%BCzenlemeleri%20i%C3%A7in%20uygulama/emlak-studiom%20v7-0/docs/ACILIS_PERFORMANS_YOL_HARITASI.md); genel sistem dökümü için [SISTEM_DURUMU_VE_TAMAMLANANLAR.md](file:///c:/Users/Hatemi/Desktop/emlak%20d%C3%BCzenlemeleri%20i%C3%A7in%20uygulama/emlak-studiom%20v7-0/SISTEM_DURUMU_VE_TAMAMLANANLAR.md); tasarım belirteçleri ve renk detayları için [UI_DESIGN_SYSTEM.md](file:///c:/Users/Hatemi/Desktop/emlak%20d%C3%BCzenlemeleri%20i%C3%A7in%20uygulama/emlak-studiom%20v7-0/UI_DESIGN_SYSTEM.md) referans alınmalıdır.

---

## 1. Kesin Sistem & Güvenlik Kuralı: Git Komutu Kullanım Standardı
- **Kullanıcı açıkça talep etmedikçe ASLA hiçbir git komutu kendiliğinden çalıştırılmayacaktır.**
- Ancak kullanıcı açıkça ve doğrudan talimat verdiğinde (örn. "push at", "commit yap", "git'e gönder" vb.), talep edilen git işlemleri güvenli bir şekilde çalıştırılabilir. Kendiliğinden/otonom olarak asla git işlemi başlatılamaz.

---

## 2. Arayüz & Buton Standartları (UI Rules)

### 2.1. Tek İkon Kuralı (Kesin Kural)
- **Çift İkon Kullanımı Yasaktır:** Bir butonda hem FontAwesome ikonu (`<i class="fa-solid ..."></i>`) hem de emoji (örn: `⚡`, `🤖`, `✨`, `📸`) **asla bir arada kullanılamaz**.
- Tercihen tek bir FontAwesome ikonu veya tek bir emoji kullanılmalıdır:
  - ✅ DOĞRU: `<i class="fa-solid fa-bolt"></i> Tümünü İndir`
  - ✅ DOĞRU: `📸 Toplu Görsel Seç`
  - ❌ YANLIŞ: `<i class="fa-solid fa-bolt"></i> ⚡ Tümünü Otomatik İndir`
  - ❌ YANLIŞ: `<i class="fa-solid fa-wand-magic-sparkles"></i> 🤖 Metni Süz`

### 2.2. Parantez İçi Açıklama Yasağı (Kesin Kural)
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

### 2.3. Net, Kısa ve Eylem Odaklı Fiiller
- Buton isimleri laf kalabalığından arındırılmış, 1-3 kelimelik net eylemler olmalıdır.
  - "Bu Efekti 3 sn Video Olarak İndir" ➡️ **"Video İndir"**
  - "Tüm Neon Çizimlerini Temizle" ➡️ **"Çizimleri Temizle"**
  - "Bu Ayarları Hazır Ayar Olarak Kaydet" ➡️ **"Hazır Ayar Kaydet"**
  - "Öncesi / Sonrası Karşılaştır" ➡️ **"Öncesi / Sonrası"**
  - "İndir & Sıradakine Geç" ➡️ **"İndir ve İlerle"**

### 2.4. Açıklamalar İçin Tooltip Kullanımı
- Kullanıcıya rehberlik edecek uzun açıklamalar buton metninin içine değil, butonun `title="..."` özniteliğine yazılmalıdır.

### 2.5. Dolgulu Kutu / Pencere / Kart Yasağı (Kesin Kural)
- Yan panellerde (sidebar) ve düzenleme sekmelerinde, uygulamanın genel sade ve beyaz/açık tasarımını bozan koyu renkli, ağır dolgulu ayrı kutular, kartlar veya "pencere" görünümlü kapsayıcılar (`background: rgba(15, 23, 42, ...)` vb.) **kesinlikle yapılmayacaktır**.
- Kontroller her zaman uygulamanın standart arayüz bileşenleri ile (`.section-title`, `.slider-group`, standart şeffaf/hafif kenarlıklı düzenler) panel zeminine doğal şekilde oturacak biçimde inşa edilmelidir.

### 2.6. Dolgulu / Katı Buton Yasağı (Standart Buton Kuralı)
- Yan panellerde gereksiz yere zıt renkli, koyu veya parlak katı dolgulu butonlar (`background: #2563eb; color: #fff` vb.) kullanılmayacaktır.
- Tüm butonlar uygulamanın standart `.btn-action` sınıfı ve açık tema stilleriyle (hafif gri tonlu mikro-gradyan, ince kenarlık, koyu antrasit yazı) uyumlu olmalı, panelin temizliğini bozmamalıdır.

### 2.7. Ayarlar İçin Standart Slider Kuralı
- Ayar ve parametre kontrolleri (AI Netleştirme, Keskinlik, Pozlama vb.) ayrı bir aç/kapa kutusu, penceresi veya toggle butonu yerine doğrudan standart `.slider-group` kaydırıcısı olarak sunulmalıdır (`0 = kapalı/etkisiz`, `>0 = aktif`).

### 2.8. Bildirim ve Toast Hijyeni (Sessiz Çalışma Prensibi)
- **Rutin İşlemlerde Bildirim Yasağı:**
  - Kullanıcı bir araca tıkladığında (Fırça, Kement, Çokgen, Silgi, Boya vb.), motor değiştirdiğinde (Hızlı / Yapay Zeka) veya bir seçim çizimini tamamladığında ekranın üstünden veya tuvalden toast / HUD banner bildirimi **asla fırlatılmayacaktır**. Butonun aktif sınıfı (`.active`) ve tuvaldeki imleç zaten durumu kullanıcıya açıkça gösterir.
  - Geri Al / İleri Al (Undo / Redo / `Ctrl+Z` / `Ctrl+Y`) işlemlerinde rutin bildirim çıkarılmayacaktır; işlem sessizce tuvale uygulanmalıdır.
  - Kaydırıcı (slider) ve fare tekerleği ile fırça boyutu / parametre değişiminde üstten toast gösterilmeyecektir; değer imleçte ve panelde anlık görünür.
- **İzin Verilen / Gerekli Bildirimler (Notification Whitelist):**
  - **Kritik Doğrulama & Hatalar:** Nesne seçilmeden "Nesneyi Kaldır"a basılması ("Lütfen silmek istediğiniz nesnenin üzerini boyayın"), hatalı dosya formatı vb.
  - **Ağır / Asenkron İşlem Tamamlanması:** AI ile netleştirme / nesne silme işleminin tamamlanması, dosya indirme veya dışa aktarma bildirimleri.
### 2.9. Buton Tipografi, Font ve Renk Standartları (Zorunlu Belirteçler)
- **Tuval Altı Dock Butonları (`.dock-btn` ve dinamik kısayollar):**
  - **Font Ailesi:** `'ClassicAmpersand', 'Inter', sans-serif`
  - **Font Boyutu:** `10.5px` (sabit butonlar), `10px` (dinamik değişken kısayollar - ekrana tam sığma garantisi)
  - **Font Kalınlığı:** `600` (normal durum), `700` (aktif/seçili durum)
  - **Yazı Rengi:** Açık temada `#0f172a` (Slate 900 koyu antrasit), koyu temada `#e2e8f0` (Slate 200)
  - **İkon Rengi:** `#475569` (Slate 600 - metinle uyumlu yumuşak antrasit)
  - **Zemin:** `linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)` (Açık), `rgba(30, 41, 59, 0.7)` (Koyu)
  - **Kenarlık:** `1px solid #cbd5e1` (Aktif: `1px solid #94a3b8`)
  - **Yükseklik & İç Boşluk:** `height: 24px - 25px; padding: 2.5px 6px;`
- **Yan Panel Butonları (`.btn-action`):**
  - **Font Ailesi:** `'ClassicAmpersand', 'Space Grotesk', sans-serif`
  - **Font Boyutu:** `11.5px` | **Kalınlık:** `700` | **Renk:** `#1e293b` (Slate 800)

### 2.10. Slider Altı Kolay Erişim / Hızlı Değer / Yüzde Butonları Yasağı (Kesin Kural)
- **Slider Altında Ön Ayar (Preset) Butonu Kullanımı Yasaktır:**
  - Sliderların (kaydırıcıların) altına veya yanına `%50`, `%80`, `%100`, `Kompakt`, `Normal`, `Geniş`, `İnce`, `Blok` vb. hızlı değer/yüzde atama butonları (`.chip`, `.preset-btn` vb.) **kesinlikle konulmayacaktır**.
  - **Gerekçe:** Slider zaten kullanıcının dilediği değeri akıcı ve hassas bir biçimde seçmesini sağlar. Slider altına eklenen bu tip ekstra butonlar görsel kirlilik yaratmakta, dikeyde gereksiz yer kaplamakta ve panellerin ekran altına taşmasına yol açmaktadır.
  - Değer seçimi daima doğrudan standart `.slider-group` kaydırıcısı üzerinden yapılmalıdır.

---

## 3. Performans ve Kod Yaşam Döngüsü Kuralları

1. **Dinamik Event Listener Hijyeni:** Global `mousemove` ve `touchmove` dinleyicileri yalnızca `mousedown` anında bağlanmalı, `mouseup` anında tamamen temizlenmelidir.
2. **On-Demand Three.js:** 3D sahnede boşta dururken 60fps render döngüsü çalıştırılamaz; sadece kamera/nesne değiştiğinde render çağrılmalıdır.
3. **Bellek Tahliyesi:** Proje sıfırlama veya yeni resim yükleme anında geçmiş (undoStack), pixel önbellekleri ve dokular temizlenmelidir.

---

## 4. Otonom Çalışma Mimarisi & Ajan Görev Dağılımı

Kullanıcının her seferinde tek tek komut vermesine gerek kalmaksızın, sistem arka planda aşağıdaki 3 bileşenli otonom mimariyle çalışmak zorundadır:

### 4.1. Ana Usta Ajan (Lead Pair Programmer - Baş Sorumlu)
- **Konumu:** Kullanıcı ile doğrudan muhatap olan ana modeldir.
- **Sorumluluğu:** Projenin tüm mimarisini, katmanlarını (DOM, Canvas, Three.js, PixiJS) ve kullanıcı tercihlerini korur.
- **Kuralı:** Kod değişikliklerini her zaman cerrahi olarak yapar; çalışan diğer fonksiyonlara ve dosya geneline zarar vermeden sadece hedef blok üzerinde çalışır.

### 4.2. Arka Plan Araştırmacısı (`research` Subagent - Sessiz Çalışma)
- **Konumu:** Büyük taramalar gerektiğinde arka planda çalışan otonom alt ajandır.
- **Ne Zaman Kullanılır:** 5'ten fazla dosyada arama yapmak, geniş kütüphane incelemesi yapmak veya binlerce satırlık logları analiz etmek gerektiğinde devreye girer.
- **Kuralı:** Ana ajanın hafızasını (bağlam penceresini) gereksiz kod yığınlarıyla şişirmez; araştırmayı arka planda sessizce bitirip ana ustaya yalnızca hedefe yönelik net dosya ve satır özetini sunar.

### 4.3. Deterministik Kalite Kapısı (Katı Makine & Kural Kontrolü)
- **Konumu:** Kod yazıldıktan hemen sonra devreye giren otomatik denetim mekanizmasıdır.
- **Kuralı:** Kullanıcı **hatırlatmadan veya istemeden**, her kod yazma işleminden hemen sonra aşağıdaki 3 aşamalı kapıyı kendiliğinden çalıştırır:
  1. **Sentaks Kapısı (Compiler Gate):** Düzenlenen tüm JavaScript dosyaları istisnasız `node -c <dosya-yolu>` ile derlenir. Sentaks hatası varsa kullanıcıya sunulmadan önce anında düzeltilir.
  2. **Arayüz Kural Kapısı (UI Linter Gate):** Eklenen veya değiştirilen HTML/CSS/JS bloklarında;
     - Çift ikon (fa-solid + emoji) var mı?
     - Parantez içi açıklama metni var mı?
     - Yan panele koyu dolgulu kutu/kart eklenmiş mi?
     - Katı parlak buton stili kullanılmış mı?
     Bu ihlaller varsa anında [UI_DESIGN_SYSTEM.md](file:///c:/Users/Hatemi/Desktop/emlak%20d%C3%BCzenlemeleri%20i%C3%A7in%20uygulama/emlak-studiom%20v7-0/UI_DESIGN_SYSTEM.md) standartlarına uygun hale getirilir.
  3. **Bellek & Dinleyici Kapısı (Memory Gate):** Eklenen fare veya dokunma olaylarının `removeEventListener` ile temizlendiği doğrulanır.
  4. **Kullanıcıya Teslim:** Yapay zeka tarayıcı üzerinde canlı uygulama testlerine girişmez; sentaks kontrolü (`node -c`) hatasız tamamlandıktan sonra uygulama kontrolü ve görsel testler doğrudan kullanıcıya teslim edilir.

### 4.4. Test & Doğrulama Sınırı: Uygulama & Arayüz Kontrolü Kullanıcıya Aittir (Kesin Kural)
- **Yapay Zeka Sadece Sentaks ve Kural Denetimi Yapar:**
  - Yapay zeka, kod değişikliklerinden sonra **yalnızca sentaks hatası olup olmadığını** (`node -c <dosya>`) ve arayüz/mimari kural kapılarını kontrol etmekle yükümlüdür.
  - **Uygulama İçi Test Yasağı:** Yapay zeka, kullanıcı açıkça talep etmedikçe tarayıcıda veya uygulamada butonlara tıklama, öge ekleme, ekran sınırlarını ölçme veya manuel test senaryolarını kendiliğinden yürütmeyecektir ("kontrolleri ben yaparım, sen uygulama kontrolünü bana bırak").
  - **Uygulama Kontrolü Kullanıcıya Bırakılır:** Kod yazılıp sentaks onayı (`node -c`) alındıktan sonra işlem tamamlanacak; uygulamanın canlı arayüz, görsel ve fonksiyonel testi daima kullanıcıya bırakılacaktır.

---

## 5. Modüler Mimari & Dosya İzolasyonu Kuralı (Monolit Şişirme Yasağı)

Büyük kod tabanlarının yönetilebilirliğini ve yapay zekanın işlem hızını korumak için aşağıdaki dosya izolasyonu kuralları zorunludur:

1. **Monolitik Dosyalara Kod Yığma Yasağı:** `styles.css` (8.500 satır), `main.js` veya `modules/three-d-engine.js` (5.000 satır) gibi dev çekirdek dosyalara yüzlerce satırlık yeni özellik blokları doğrudan eklenemez.
2. **Yeni Özellikler İçin Alt Modül Standartları:** Yeni bir sekme, filtreleme paneli, 3D araç veya harita özelliği geliştirildiğinde;
   - Stiller `css/<ozellik>.css` dosyasına yazılır ve `app.html` içinde `<link rel="stylesheet" ...>` ile dahil edilir.
   - Fonksiyonlar `modules/<ozellik>.js` dosyasına yazılır ve modüler olarak bağlanır.
3. **Kademeli Ayıklama (Gradual Extraction):** Mevcut monolit dosyalardaki kendi içinde bağımsız mantıksal bloklar (örneğin daha önce yapılan `css/callouts.css` ve `css/three-d.css` gibi), sistem kararlılığını bozmadan adım adım harici alt dosyalara taşınarak monolitlerin yükü hafifletilmelidir.
4. **Tek Sorumluluk Prensibi (Single Responsibility):** Yeni yazılan her modül tek bir işleve odaklanmalı ve ideal olarak 300-500 satırı aşmayacak şekilde kompakt tutulmalıdır.

---

## 6. Kullanıcı Taleplerinde Çakışma & Risk Analizi Kuralı (Önce Rapor / Erken Uyarı Standardı)
- Kullanıcı herhangi bir özellik, değişiklik, davranış veya mantık talep ettiğinde; eğer talep edilen işlem uygulamada, mevcut mimaride veya herhangi bir menü/araç/katman çalışmasında **bir çakışmaya, bozulmaya, görsel kirliliğe veya başka bir soruna** yol açma riski taşıyorsa:
  1. Kod değişikliğine doğrudan geçilmeyecek, **önce detaylı bir risk/çakışma raporu** kullanıcıya sunulacaktır.
  2. Raporda; çakışmanın nedeni, etkilenecek bileşenler ve varsa güvenli alternatif çözüm senaryoları net olarak açıklanacaktır.
  3. Kullanıcı raporu inceleyip onay verdikten veya kararlaştırılan yönde talimat verdikten sonra uygulama aşamasına geçilecektir.

