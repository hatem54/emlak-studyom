# Emlak Stüdyom - UI Tasarım Sistemi & Mimari Standartları
**Sürüm:** 7.0  
**Durum:** Aktif & Zorunlu  
**Kapsam:** Tüm Arayüz Bileşenleri, Renk Paleti, Buton Mimarisi, Olay ve Bellek Yaşam Döngüsü

Bu belge, Emlak Stüdyom projesindeki tüm görsel ve yapısal standartları tek bir çatı altında toplar. Uygulama üzerinde geliştirme yapan tüm geliştiriciler ve yapay zeka ajanları bu kurallara istisnasız uymakla yükümlüdür.

---

## 1. Renk Paleti & Tasarım Belirteçleri (Color Tokens)

Uygulama iki ana tema destekler: **Açık Tema (Varsayılan Masaüstü)** ve **Koyu Tema (Derin Lacivert / Dark Luxury Slate)**.

### 1.1. Açık Tema (Default Light Theme - `html[data-theme="light"]`)
Masaüstü kullanıcıları için varsayılan ferah, kurumsal ve modern açık tema paleti:
- **Ana Zemin (App Background):** `#f1f5f9` (Tailwind Slate 100)
- **Panel & Kart Zeminleri (Panels / Drawers):** `#ffffff` (Saf Beyaz)
- **İkincil / İç Kutu Zeminleri (Inputs, Insets):** `#f8fafc` (Slate 50)
- **Hafif Ayırıcı Kenarlıklar (Borders):** `#e2e8f0` (Slate 200)
- **Vurgulu Kenarlıklar (Hover / Active Border):** `#cbd5e1` (Slate 300)
- **Birincil Metin (Headings, Primary Text):** `#0f172a` (Slate 900)
- **İkincil Metin (Labels, Muted Text):** `#64748b` (Slate 500)
- **Odak & Vurgu (Focus Ring, Accent):** `#0284c7` (Sky 600) / `#38bdf8` (Sky 400)

### 1.2. Koyu Tema (Dark Theme - Varsayılan CSS Değişkenleri)
- **Ana Zemin:** `#0A0A1A` (Derin Gece Mavisi)
- **Panel Zeminleri:** `#12122A` (Koyu Panel Mavisi)
- **İkincil Zeminler / Inputlar:** `#1A1A3E` / `#0f172a`
- **Kenarlıklar:** `rgba(108, 92, 231, 0.2)` / `#334155`
- **Birincil Metin:** `#E0E0FF` / `#f1f5f9`
- **İkincil Metin:** `#8888AA` / `#94a3b8`

### 1.3. Aksiyon & Durum Renk Gradyanları (Her İki Tema İçin Ortak)
Tüm butonlar ve rozetler hafif mikro-gradyanlarla derinlik kazanır:
- **🟦 Mavi / Primary (Birincil İşlem):** `linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)`  
  *Gölge:* `0 2px 6px rgba(2, 132, 199, 0.22)`
- **🟩 Yeşil / Success (Kaydet, Dışa Aktar, Uydu):** `linear-gradient(135deg, #059669 0%, #10b981 100%)`  
  *Gölge:* `0 2px 6px rgba(16, 185, 129, 0.22)`
- **🟥 Kırmızı / Danger (Sil, Temizle, Kaldır):** `linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)`  
  *Gölge:* `0 2px 6px rgba(244, 63, 94, 0.22)`
- **🟨 Sarı / Amber (Sıfırla, Önizle, Geri Al):** `linear-gradient(135deg, #d97706 0%, #f59e0b 100%)`  
  *Gölge:* `0 2px 6px rgba(245, 158, 11, 0.22)`
- **🟪 Mor / AI (Yapay Zeka, Akıllı Süzgeç):** `linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)`  
  *Gölge:* `0 2px 6px rgba(124, 58, 237, 0.22)`
- **🔷 Camgöbeği / Cyan (Harita, Araçlar):** `linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)`

---

## 2. Buton Tasarım Mimarisi (.btn-action)

Uygulama genelinde rastgele buton sınıfları yazılması yasaktır. Tüm butonlar `.btn-action` temel sınıfı üzerine kuruludur.

### 2.1. Standart Buton Sınıfları & Kullanım Alanları

| Buton Sınıfı | Tema / Görünüm | Kullanım Yeri & Anlamı |
|---|---|---|
| `.btn-action` (Yalın) | Açık temada beyaz zemin, ince gri sınır, antrasit yazı | Yan panellerdeki standart işlemler, araç seçimleri, sekme kontrolleri |
| `.btn-action.btn-blue` / `.btn-primary` | Mavi gradyan dolgulu, beyaz yazı | Form onaylama, seçimi fotoğrafa uygulama, birincil eylemler |
| `.btn-action.btn-green` / `.btn-save` | Zümrüt yeşili gradyan dolgulu | "Görseli İndir", "Projeyi Kaydet", "Dışa Aktar" |
| `.btn-action.btn-red` | Mercan kırmızısı gradyan dolgulu | "Çizimleri Temizle", "Elemanı Sil", "Sıfırla" |
| `.btn-action.btn-purple` / `.btn-ai` | Canlı mor gradyan dolgulu | "Metni Süz", "AI İyileştir", "Otomatik Analiz" |
| `.btn-action.btn-yellow` | Altın sarısı gradyan dolgulu | "Hazır Ayar Yükle", "Açıları Sıfırla", "Geri Al" |

### 2.2. Buton Yazım Standartları (HTML Kod Örnekleri)

```html
<!-- ✅ DOĞRU: Tek FontAwesome ikonu, 1-3 kelimelik net fiil, parantez yok, tooltip var -->
<button class="btn-action btn-green" title="Tasarımı yüksek çözünürlükte cihazınıza kaydeder">
  <i class="fa-solid fa-download"></i> Görseli İndir
</button>

<button class="btn-action" title="Tüm nesneleri merkez hizasına taşır">
  <i class="fa-solid fa-arrows-to-dot"></i> Ortala
</button>

<!-- ❌ YANLIŞ: Çift ikon (hem i hem emoji), parantez içi açıklama, gereksiz uzun metin -->
<button class="btn-action btn-green">
  <i class="fa-solid fa-download"></i> ⚡ Görseli İndir (Yüksek Kalite PNG)
</button>
```

### 2.3. Buton Tipografi, Font, Renk ve Boyut Belirteçleri (Typography & Token Specifications)

Uygulamadaki tüm butonların (tuval altı dock butonları ve yan panel butonları) görsel bütünlüğü ve ekran taşmalarını önlemek için aşağıdaki belirteçler zorunludur:

| Özellik / Belirteç | Tuval Altı Sabit Butonlar (`.dock-btn`) | Tuval Altı Dinamik Kısayollar (`.dock-contextual-slot .dock-btn`) | Yan Panel Butonları (`.btn-action`) |
| :--- | :--- | :--- | :--- |
| **Yazı Tipi (Font-Family)** | `'ClassicAmpersand', 'Inter', sans-serif` | `'ClassicAmpersand', 'Inter', sans-serif` | `'ClassicAmpersand', 'Space Grotesk', sans-serif` |
| **Yazı Boyutu (Font-Size)** | `10.5px` | `10px` (Kompakt Sığma) | `11.5px` |
| **Yazı Kalınlığı (Font-Weight)** | `600` (Semi-Bold) | `600` (Semi-Bold) | `700` (Bold) |
| **Aktif Kalınlık (Active Weight)** | `700` (`.lock-active`, `.active`) | `700` (`.active`) | `700` (`.active`) |
| **Yazı Rengi (Açık Tema)** | `#0f172a` (Slate 900) | `#0f172a` (Slate 900) | `#1e293b` (Slate 800) |
| **Yazı Rengi (Koyu Tema)** | `#e2e8f0` (Slate 200) | `#e2e8f0` (Slate 200) | `#f1f5f9` (Slate 100) |
| **İkon Rengi (Icon Color)** | `#0f172a` / `#475569` | `#475569` (Slate 600) | İlgili aksiyon rengi veya beyaz |
| **Zemin (Açık Tema)** | `linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)` | `linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)` | `linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)` |
| **Aktif Zemin (Açık Tema)** | `linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)` | `linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)` | Mikro-gradyanlı durum dolgusu |
| **Kenarlık (Border)** | `1px solid #cbd5e1` (Aktif: `#94a3b8`) | `1px solid #cbd5e1` (Aktif: `#94a3b8`) | `1px solid #cbd5e1` |
| **İç Boşluk (Padding)** | `2.5px 6px` | `2.5px 6px` | `8px 12px` |
| **Yükseklik (Height)** | `25px` | `24px` | Otomatik (`~32px`) |
| **Köşe Yuvarlama (Radius)** | `6px` | `5px` | `7px` |

---

## 3. Kesin ve Bağlayıcı Arayüz Kuralları (Core UX Rules)

### Kural 1: Tek İkon Kuralı (Strict Single Icon)
- Bir butonda, rozette veya başlık etiketinde **asla hem FontAwesome ikonu (`<i class="fa-..."></i>`) hem de Emoji (`⚡`, `🤖`, `✨`, `📸`) bir arada kullanılamaz**.
- Yalnızca tek bir ikon tipi tercih edilmelidir (tercihen FontAwesome).

### Kural 2: Parantez İçi Açıklama Yasağı (No Parentheses in Labels)
- Buton ve etiket metinlerinde `(Gelişmiş)`, `(0°)`, `(Önerilen)`, `(Adım Adım Düzenle)` gibi parantezli açıklamalar yer alamaz.
- Tüm yönlendirici açıklamalar `title="..."` özniteliği veya tooltip mekanizması ile verilmelidir.

### Kural 3: 1-3 Kelimelik Net Eylem Fiilleri
- Butonlar laf kalabalığından arındırılmış, emir kipinde net fiiller olmalıdır:
  - *Yanlış:* "Bu Efekti 3 Saniye Video Olarak İndir" ➡️ **Doğru:** "Video İndir"
  - *Yanlış:* "Tüm Neon Çizimlerini Ekranda Temizle" ➡️ **Doğru:** "Çizimleri Temizle"
  - *Yanlış:* "Öncesi ve Sonrası Görünümlerini Karşılaştır" ➡️ **Doğru:** "Öncesi / Sonrası"

### Kural 4: Dolgulu Kutu / Pencere / Kart Yasağı (No Heavy Dark Insets)
- Yan panellerde (sidebar) uygulamanın sade açık/beyaz temasını bozan koyu renkli, ağır dolgulu ayrı pencereler (`background: rgba(15, 23, 42, 0.95)`, `background: #0f172a`) eklenemez.
- Arayüz elemanları doğrudan `.section-title`, standart form grupları ve hafif kenarlıklı panellere oturtulmalıdır.

### Kural 5: Ayarlar İçin Standart Slider Kuralı (Slider Over Toggles)
- AI Netleştirme, Keskinlik, Pozlama, Opaklık gibi ayarlar için gereksiz aç/kapa butonları ve ek kutular oluşturulamaz.
- Doğrudan standart `.slider-group` kaydırıcısı kullanılır (`0 = kapalı/etkisiz`, `> 0 = aktif`).

### Kural 6: Slider Altı Hızlı Değer / Yüzde Preset Butonları Yasağı (No Slider Preset Chips)
- Sliderların (kaydırıcıların) altına veya yanına `%50`, `%80`, `%100`, `Kompakt`, `Normal`, `Geniş`, `İnce`, `Blok` gibi hızlı değer/yüzde atama butonları (`.chip`, `.preset-btn` vb.) kesinlikle eklenemez.
- Slider bileşeni zaten hassas ve kademeli ayar yapmayı sağladığından, bu tip butonlar arayüzü kalabalıklaştırmakta ve panellerin ekran altına taşmasına yol açmaktadır. Değer seçimi sadece kaydırıcı üzerinden yapılmalıdır.

---

## 4. Olay Dinleyicisi & Bellek Yaşam Döngüsü (Performance & Memory)

1. **Dinamik Sürükleme (Drag & Drop) Hijyeni:**
   - Global `mousemove`, `touchmove`, `mouseup`, `touchend` dinleyicileri sayfa açılışında `document` üzerine kalıcı olarak **bağlanamaz**.
   - Dinleyiciler yalnızca `mousedown` / `touchstart` tetiklendiğinde dinamik olarak eklenir, parmak veya fare bırakıldığı (`mouseup`/`touchend`/`touchcancel`) anda `removeEventListener` ile tamamen silinir.
2. **Kapanan Pencerelerin Temizliği:**
   - Sağ tık menüsü (context menu), renk seçici popover veya modal kapatıldığında ilişkili tüm geçici dinleyiciler ve zamanlayıcılar (`clearInterval`, `clearTimeout`) sıfırlanmalıdır.
3. **Three.js & Canvas Doku Yönetimi:**
   - Renk ve yazı değişikliklerinde 3D geometri asla sıfırdan hesaplanıp `ExtrudeGeometry` yeniden üretilmez; doğrudan materyalin rengi güncellenir (`material.color.set()`).
   - SVG veya HTML dokuları üretildiğinde `requestAnimationFrame` debouncing uygulanır.
4. **On-Demand (İhtiyaç Halinde) Render:**
   - Boşta duran sahnelerde saniyede 60 kare render döngüsü çalıştırılamaz. Sadece kullanıcı kamerayı döndürdüğünde, nesne seçtiğinde veya parametre değiştirdiğinde tek kare render (`requestRender`) tetiklenir.
5. **Sayfa Sıfırlama ve Taslak Temizliği:**
   - Proje sıfırlandığında `undoStack`, `redoStack`, IndexedDB otomatik kayıtları ve Pixi/Three.js sahne nesneleri tam olarak temizlenir.
