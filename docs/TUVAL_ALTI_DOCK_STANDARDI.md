# Emlak Stüdyom - Tuval Altı Hızlı Erişim Çubuğu (Canvas Bottom Dock) Mimari & Buton Standardı

Bu doküman, uygulamanın tuval altı kontrol çubuğunun (`#canvasBottomDock`) 3 bölgeli mimarisini, sabit ve dinamik buton ayrımını, tüm sekmelere ait kısayol haritasını ve gelecekte eklenecek yeni araçlar için uyulması zorunlu yerleşim kurallarını tanımlar.

---

## 1. Mimari Düzen: 3 Bölgeli Hibrit Dock Yapısı

Tuval altı kontrol çubuğu, kullanıcının çalışma ergonomisini bozmamak ve tuval üzerinde tam hakimiyet sağlamak için **3 bağımsız bölgeye** ayrılmıştır:

```
+-----------------------------------------------------------------------------------------------------------------------------------------+
| [Görsel Aç] [Sabit] | [  DİNAMİK ORTA KISAYOL ALANI (Aktif Sekmeye Göre Değişir)  ] | [Formatla] [Öncesi/Sonrası] [Sığdır] [Tam Ekran] [Izgara] [Geri Al] [İleri Al] [İndir] |
| <--- SOL SABİT ---> | <------------------ ORTA DİNAMİK -------------------------> | <------------------------------ SAĞ SABİT ------------------------------> |
+-----------------------------------------------------------------------------------------------------------------------------------------+
```

---

## 2. Sabit Bölgeler (Her Sekmede Kesintisiz Kalıcı Araçlar)

Hangi menüde, sekmede veya düzenleme aracında olunursa olunsun, aşağıdaki butonlar **daima yerini ve konumunu korur**:

### 2.1. Sol Sabit Bölge (Arka Plan ve Zemin Güvenliği)
| Buton | ID / Seçici | İkon | Tetiklenen Eylem | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| **Görsel Aç** | `#dockOpenImgBtn` | `fa-folder-open` | `imageInput.click()` | Bilgisayardan yeni ana fotoğraf veya şablon açar. (PC'de görünür) |
| **Sabit / Serbest** | `#dockLockBtn` | `fa-thumbtack` | `window.togglePhotoLockFromDock()` | Arka plan fotoğrafını tuvalde sabitler veya serbest bırakır (yanlışlıkla sürüklemeyi önler). |

### 2.2. Sağ Sabit Bölge (Sağdan Formatla'ya Kadar Kalıcı Küresel Araçlar)
| Buton | ID / Seçici | İkon | Tetiklenen Eylem | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| **Formatla** | `#dockGlobalFormatBtn` | `fa-crop-simple` | `window.openQuickFormatFromDock()` | Tuval en-boy oranını (16:9, 1:1, 9:16, 4:3, A4 vb.) anında değiştirir veya kadrajlar. |
| **Öncesi / Sonrası** | `#dockGlobalBeforeAfterBtn`| `fa-code-compare`| `window.togglePhotoBeforeAfterInstant()` | Orijinal görsel ile üzerinde çalışılan filtrelenmiş görseli anlık kıyaslar. |
| **Sığdır** | `#dockFitCanvasBtn` | `fa-expand` | `window.fitImageToCanvas()` | Tuvali çalışma alanına tam ortalar ve sığdırır. |
| **Tam Ekran** | `#dockFullscreenBtn` | `fa-maximize` | `window.toggleCanvasFullscreen()` | Tuvali tam ekran moduna alır. |
| **Izgara** | `#dockGridBtn` | `fa-border-all` | `window.toggleCanvasGrid()` | Kılavuz ızgarasını açıp kapatır (sağ tık ile aralık ayarları). |
| **Şablon Gizle** | `#dockToggleTemplateBtn` | `fa-eye-slash` | `window.toggleTemplateVisibility()` | Şablonu geçici olarak görünmez yapar veya açar. |
| **Şablon Sıfırla**| `#dockResetTemplateBtn` | `fa-arrows-rotate`| `window.resetActiveTemplateToDefault()`| Şablonu orijinal varsayılan ölçülerine sıfırlar. |
| **Geri Al** | `.dock-icon-btn` | `fa-rotate-left` | `window.undoGlobal()` | Son işlemi geri alır. |
| **İleri Al** | `.dock-icon-btn` | `fa-rotate-right`| `window.redoGlobal()` | Geri alınan işlemi yineler. |
| **İndir** | `#dockDownloadOriginalBtn`| `fa-download` | `window.downloadOriginalFromDock()` | Tasarımı orijinal yüksek çözünürlükte dışa aktarır. |

---

## 3. Orta Dinamik Kontekst Bölgesi (`#dockContextualSlot`)

Sol ve sağ sabit bölgelerin arasında yer alan bu slot, sol paneldeki aktif sekmeye veya seçili tuval ögesine göre anında değişir. Her sekme yalnızca kendi işlevini gören **3 ila 6 odaklı mikro butona** sahiptir.

### 3.1. Sekme Bazlı Buton Haritası

#### 1. Görseller / Görsel Havuzu (`staging`)
*Görsel havuzundaki çoklu fotoğrafların işlenmesi ve toplu yönetimi için:*
- **Tuvale Aktar** (`fa-arrow-up-right-from-square`) -> Havuzdaki aktif fotoğrafı tuvale yükler.
- **Toplu İndir** (`fa-file-zipper`) -> Seçili fotoğrafları ZIP olarak toplu indirir.
- **Filigran** (`fa-shield-halved`) -> Görsellere logo ve filigran ekleme çekmecesini açar.
- **PDF Portföy** (`fa-file-pdf`) -> Havuzdaki görsellerle A4 PDF broşür üretir.
- **Netleştir** (`fa-wand-magic-sparkles`) -> Yapay zeka HD netleştirme panelini açar.
- **Havuzu Boşalt** (`fa-broom`) -> Havuzu ve tuvali sıfırlar.

#### 2. Fotoğraf (`photo`)
*Fotoğraf filtreleri, renk ayarları ve rötuş araçları için:*
- **Netleştir** (`fa-wand-magic-sparkles`) -> AI HD Netleştirici modalını açar.
- **Silgi** (`fa-eraser`) -> İstenmeyen nesneleri silme (Magic Eraser) moduna geçer.
- **Klonla** (`fa-clone`) -> Doku klonlama damgası moduna geçer.
- **Maskeler** (`fa-circle-dot`) -> Radyal ve lineer yerel maske panelini açar.
- **Sıfırla** (`fa-arrows-rotate`) -> Tüm fotoğraf ve filtre ayarlarını sıfırlar.

#### 3. Çizim (`draw`)
*Parsel sınırları, alan ve cephe çizimleri için:*
- **Çokgen** (`fa-draw-polygon`) -> Çokgen parsel çizimini başlatır.
- **Çizgi** (`fa-slash`) -> Düz çizgi çizim modunu açar.
- **Hizalama** (`fa-magnet`) -> Akıllı manyetik hizalama kılavuzlarını açar/kapatır.
- **Metre** (`fa-ruler-combined`) -> Parsel ve cephe mesafe ölçüm bandını açar/kapatır.
- **Temizle** (`fa-trash-can`) -> Tuvaldeki tüm çizimleri temizler.

#### 4. Çokgen Çizim Modu (`draw_poly` - Çizim Yapılırken Aktif)
- **Tamamla** (`fa-check`) -> Çokgeni kapatır ve şekli bitirir.
- **Hizalama** (`fa-magnet`) -> Manyetik kilitlemeyi açar/kapatır.
- **Geri Al** (`fa-arrow-rotate-left`) -> Eklenen son tepe noktasını geri alır.
- **İptal** (`fa-xmark`) -> Çokgen çizimini iptal eder.

#### 5. Şablonlar (`canva`)
*Kolaj, hazır emlak şablonları ve çoklu sayfalar için:*
- **Sayfa Ekle** (`fa-file-circle-plus`) -> Yeni albüm sayfası ekler.
- **Kaydet** (`fa-floppy-disk`) -> Tasarımı özel şablon olarak kaydeder.
- **Çerçeve** (`fa-border-all`) -> Şablon dış çerçeve çizgisini açar/kapatır.
- **Renkler** (`fa-palette`) -> Şablon renk paleti modalını açar.
- **Çoklu Gönderi** (`fa-film`) -> Sosyal medya albüm film şeridini açar/kapatır.

#### 6. Rozetler (`callout`)
*Dikkat çekici emlak etiketleri ve rozetleri için:*
- **Daire** (`fa-circle-dot`) -> Daire vurgu rozeti ekler.
- **Şerit** (`fa-bookmark`) -> Şerit başlık rozeti ekler.
- **Etiket** (`fa-tag`) -> Fiyat veya durum etiketi ekler.
- **Metre** (`fa-ruler-combined`) -> Metre ölçüm bandını açar/kapatır.

#### 7. İkon (`icons`)
*Emlak ve iletişim ikonları için:*
- **Konum** (`fa-location-dot`) -> Konum pini ikonu ekler.
- **m²** (`fa-vector-square`) -> Metrekare rozet ikonu ekler.
- **Fiyat** (`fa-turkish-lira-sign`) -> Para / TL ikonu ekler.
- **Şeffaf** (`fa-file-image`) -> Arka planı şeffaf PNG olarak dışa aktarır.

#### 8. Katmanlar (`layers`)
*Katman sıralaması ve görünürlük yönetimi için:*
- **Kilitle** (`fa-lock`) -> Tüm katmanları kilitler.
- **Kilidi Aç** (`fa-lock-open`) -> Tüm katmanların kilidini açar.
- **Göster** (`fa-eye`) -> Tüm katmanları görünür yapar.
- **Öne** (`fa-arrow-up`) -> Seçili katmanı bir basamak öne getirir.
- **Arkaya** (`fa-arrow-down`) -> Seçili katmanı bir basamak arkaya gönderir.

#### 9. Yazı & Font (`font`)
*Tipografi ve metin kontrolleri için:*
- **Yazı Ekle** (`fa-font`) -> Serbest yazı ekler.
- **Çerçeveli** (`fa-square-pen`) -> Kutu içine çerçeveli yazı ekler.
- **3D Metin** (`fa-cube`) -> 3B kabartmalı metin stüdyosunu açar.

#### 10. Şablon Oluştur (`create-template`)
*Kullanıcının kendi şablonunu sıfırdan inşa etmesi için:*
- **Çerçeve** (`fa-image`) -> Görsel çerçevesi ekler.
- **Hizalama** (`fa-magnet`) -> Kılavuz hizalamayı açar/kapatır.
- **Toplu Görsel** (`fa-images`) -> Tüm çerçevelere sırayla görsel yükler.
- **Bilgi Kartı** (`fa-id-card`) -> Alta emlak bilgi kartı ekler.
- **Fiyat** (`fa-tag`) -> Fiyat rozeti ekler.
- **Kaydet** (`fa-floppy-disk`) -> Şablonu kaydeder.

#### 11. Ekstra Araçlar (`settings`)
*Firma kimliği, renkler ve yardımcı modüller için:*
- **Renkler** (`fa-palette`) -> Renk uyum paleti modalını açar.
- **3D Stüdyo** (`fa-cube`) -> 3B Düzlem & Metin motorunu açar.
- **Logo** (`fa-shield-halved`) -> Firma logosu yükleme penceresini açar.
- **QR Kod** (`fa-qrcode`) -> QR Kod üretici sekmesine geçer.

#### 12. Çıktı (`batch`)
*Çoklu format dışa aktarma ve proje kaydetme için:*
- **Toplu Çıktı** (`fa-images`) -> Toplu görsel çıktı bölümünü açar.
- **Çoklu Gönderi** (`fa-film`) -> Sosyal medya albüm şeridini açar.
- **Şeffaf** (`fa-file-image`) -> Şeffaf PNG indirir.
- **Şablon Aç** (`fa-folder-open`) -> `.json` proje dosyasını açar.
- **Kaydet** (`fa-floppy-disk`) -> Projeyi `.json` olarak kaydeder.
- **Tuvali Temizle** (`fa-trash-can`) -> Tuvali sıfırlar.

#### 13. Giriş (`data`)
*İlan verisi ve metin ayrıştırma için:*
- **Yapıştır** (`fa-paste`) -> Panodaki metni yapıştırıp otomatik ayrıştırır.
- **KML** (`fa-map-location-dot`) -> KML/KMZ parsel dosyası yükler.
- **Örnek** (`fa-wand-magic-sparkles`) -> Örnek ilan verisi doldurur.
- **Tuvali Temizle** (`fa-trash-can`) -> Tuvali sıfırlar.

#### 14. 2D Seçili Öge (`element`)
*Tuvalde herhangi bir yazı, kutu veya rozet seçildiğinde anında aktifleşir:*
- **Ayarlar** (`fa-sliders`) -> Öge font ve kutu ayarları panelini açar.
- **Döndür** (`fa-rotate-right`) -> Ögeyi 15° döndürür (sağ tık: -15°).
- **Aynala** (`fa-arrows-left-right`) -> Ögeyi yatay olarak ters çevirir.
- **Serbest / Kilit** (`fa-lock-open`) -> Ögeyi tuvalde kilitler veya açar.
- **Çoğalt** (`fa-clone`) -> Ögenin kopyasını oluşturur.
- **Hizalama** (`fa-magnet`) -> Manyetik hizalamayı açar/kapatır.
- **Ögeyi Sıfırla** (`fa-arrow-rotate-left`) -> Ögenin açı ve boyutunu varsayılana döndürür.
- **Sil** (`fa-trash-can`) -> Seçili ögeyi siler.

#### 15. 3D Seçili Öge (`3d`)
*Tuvalde 3D bir metin veya nesne seçildiğinde aktifleşir:*
- **3D Panel** (`fa-cube`) -> 3B stüdyo panelini açar/kapatır.
- **Döndür** (`fa-rotate-right`) -> 3D nesneyi döndürür.
- **Aynala** (`fa-arrows-left-right`) -> 3D nesneyi aynalar.
- **Kilit** (`fa-lock-open`) -> 3D nesneyi kilitler veya serbest bırakır.
- **Çoğalt** (`fa-clone`) -> 3D nesneyi çoğaltır.
- **Öne** (`fa-layer-group`) -> 3D nesneyi en öne taşır.
- **Sıfırla** (`fa-arrow-rotate-left`) -> 3D açı ve derinliği sıfırlar.
- **Sil** (`fa-trash-can`) -> 3D nesneyi siler.
*(Altında 3D Eksen ve Gizmo Kontrolleri `#dock3DControls` otomatik görünür)*

#### 16. Sihirli Silgi (`eraser` - Silgi Modu Aktifken)
- **Sil** (`fa-wand-magic-sparkles`) -> Fırçayla boyanan nesneyi AI ile siler.
- **Temizle** (`fa-trash-can`) -> Silgi maskesini temizler.
- **Geri Al** (`fa-arrow-rotate-left`) -> Son silme adımını geri alır.
- **Kapat** (`fa-xmark`) -> Silgi modundan çıkar.

#### 17. Klonlama Damgası (`clone` - Klon Modu Aktifken)
- **Kaynak** (`fa-crosshairs`) -> Kaynak doku alma modunu seçer.
- **Klonla** (`fa-brush`) -> Hedef alana dokuyu boyama modunu seçer.
- **Temizle** (`fa-trash-can`) -> Klonlama maskesini temizler.
- **Kapat** (`fa-xmark`) -> Klon modundan çıkar.

#### 18. Yerel Maskeler (`mask` - Radyal, Lineer, Fırça)
- **Uygula** (`fa-check`) -> Maske efektini kalıcı uygular.
- **Temizle** (`fa-trash-can`) -> Maske çizimini temizler.
- **Kapat** (`fa-xmark`) -> Maske modundan çıkar.

#### 19. Şekiller (`shapes`)
- **Dikdörtgen** (`fa-square`) -> Tuvale dikdörtgen şekil ekler.
- **Daire** (`fa-circle`) -> Tuvale daire şekil ekler.
- **Çizgi** (`fa-minus`) -> Düz çizgi ekler.
- **Ok** (`fa-arrow-right`) -> Vurgu oku ekler.

#### 20. QR Kod (`qr`)
- **QR Üret** (`fa-qrcode`) -> Girilen linki QR koda dönüştürür.
- **İlan Linki** (`fa-link`) -> Hazır ilan linki taslağı doldurur.
- **WhatsApp** (`fa-brands fa-whatsapp`) -> WhatsApp iletişim linki doldurur.
- **Konum** (`fa-location-dot`) -> Google Haritalar linki doldurur.

#### 21. Marka (`brand`)
- **Logo Yükle** (`fa-shield-halved`) -> Firma logosu yükler.
- **Filigran** (`fa-stamp`) -> Filigran damgalama ayarını açar.
- **Renkler** (`fa-palette`) -> Kurumsal renk paleti modalını açar.
- **İletişim** (`fa-address-card`) -> Kurumsal kartvizit bilgi kutusu ekler.

---

## 4. UI / CSS Tasarım & Tipografi Kuralları

1. **Tek İkon Kuralı (Kesin Kural):** Bir dock butonunda hem FontAwesome ikonu hem de emoji ASLA bir arada kullanılamaz. Sadece tek bir `<span class="dock-icon"><i class="fa-solid ..."></i></span>` kullanılır.
2. **Parantez İçi Açıklama Yasağı (Kesin Kural):** Buton etiketlerinde (`.dock-label`) parantez içi yönlendirmeler (`(Önizle)`, `(Geçici)` vb.) yazılamaz. Detaylı açıklamalar butonun `title="..."` özniteliğine yazılır.
3. **Standart Buton Boyutları:**
   - Sabit Butonlar: Font boyutu `10.5px`, yükseklik `24-25px`, `padding: 2.5px 6px`.
   - Dinamik Değişken Kısayollar: Font boyutu `10px`, `padding: 2.5px 6px`.
   - İkon Butonları: `26x26px`, ortalanmış ikon.
4. **Yatay Taşmama Koruması:**
   - `#canvasBottomDock` kapsayıcısına `overflow-x: auto; scrollbar-width: none;` uygulanmıştır.
   - Fare tekerleği (`wheel`) olayı yatay kaydırmaya dönüştürülür, butonlar hiçbir çözünürlükte alt satıra kırılmaz.
5. **Açık / Koyu Tema Desteği:**
   - Açık Temada: Buton zeminleri `#ffffff`, kenarlık `#cbd5e1`, metin `#0f172a`, ikon `#475569`.
   - Koyu Temada: Buton zeminleri `rgba(30, 41, 59, 0.7)`, kenarlık `#334155`, metin `#e2e8f0`.

---

## 5. Yeni Bir Sekme veya Araç Eklendiğinde İzlenecek Prosedür

Sisteme gelecekte yeni bir sekme veya modal aracı eklendiğinde:
1. `app.html` içinde `#dockContextualSlot` içerisine `<div id="dockGroup_<yeni_ad>" class="dock-context-group">` şeklinde 3-5 adet mikro buton yerleştirilir.
2. `modules/dock-manager.js` içindeki `setContext(contextName)` fonksiyonuna bu grubun ismi eklenir.
3. Asla sol sabit (`Görsel Aç`, `Sabit`) veya sağ sabit (`Formatla`'dan `İndir`'e kadar) butonların sırası veya yapısı bozulamaz.
4. Bu doküman (`docs/TUVAL_ALTI_DOCK_STANDARDI.md`) yeni eklenen sekmeyle güncellenir.
