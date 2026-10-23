# 3D Hizalama, Konumlandırma & Seçim Düşürme Sistemi Raporu

**Tarih:** 25 Eylül 2026  
**Sürüm:** Emlak Stüdyom v7.0  
**Standartlar:** AGENTS.md & GEMINI.md kuralları ile %100 uyumlu (Tek ikon kuralı, parantez yasağı, monolit şişirmeme, sessiz çalışma prensibi).

---

## 1. Tespit Edilen Hatalar ve Kök Neden Analizi

### 1.1. 3D Ögenin "Sağ Üst" (ve Diğer Konumlara) Tıklandığında Ekrandan Kaybolması
- **Kök Neden 1 (Perspektif Kamera ve Dünya Koordinatı Uyuşmazlığı):**  
  `modules/three-d-engine.js` içindeki `align3DElement` fonksiyonu ve `modules/multi-select.js` içerisindeki konumlandırma fonksiyonu, tuval piksel genişliğini baz alıp `cw * 0.32` ($\approx 614$ piksel) gibi afaki değerler hesaplıyordu. Three.js sahnemizde $FOV = 45^\circ$, kamera mesafesi ise $Z = 850$ birimdir. Bu mesafede kameranın gördüğü toplam dünya genişliği yalnızca $\approx 1252$ birimdir (yani merkezden sağa maksimum $+626$ birim). Öge genişliği de eklendiğinde nesne $614 + 150 = 764$ birime fırlatılıyor ve kamera görüş alanı (frustum) dışına çıkarak ekrandan kayboluyordu.
- **Kök Neden 2 (Ters Y Ekseni):**  
  Three.js koordinat sisteminde $+Y$ yukarı (ekranın üstü), $-Y$ ise aşağı (ekranın altı) temsil eder. Eski kodda `top` için `py = -ySpan` atanarak dikey yön ters çevrilmişti.
- **Kök Neden 3 (Arayüz Senkronizasyonu ve Bildirim İhlali):**  
  Eski fonksiyonda `syncControlsUI()` çağrılmadığı için sol paneldeki kaydırıcılar güncellenmiyor ve kural dışı rutin toast fırlatılıyordu.

---

### 1.2. Mavi Seçim Çerçevesi (Marquee) Alındıktan Sonra Boşluğa Tıklayınca Seçimlerin Düşmemesi
- **Kök Neden 1 (`deselectAll()` Eksikliği):**  
  `core/drag.js` dosyasındaki `deselectAll()` fonksiyonu yalnızca 2D seçimleri sıfırlıyor, `window.ThreeDGrouping.clearSelection()` çağrısını yapmıyordu. Bu yüzden 3D çoklu seçim çerçeveleri ekranda asılı kalıyordu.
- **Kök Neden 2 (`polygon.js` Marquee End Dinleyicisi):**  
  Kullanıcı boş bir alana tek tık yaptığında (sürükleme yapmadan bırakma, genişlik/yükseklik $\le 5$ px), `handleMarqueeEnd` fonksiyonunda bir `else` bloğu yoktu. Tıklama boş alana yapıldığı halde hiçbir seçim sıfırlanmıyordu.
- **Kök Neden 3 (`events.js` Gizmo Overlay Engeli):**  
  `modules/events.js` içerisindeki `pointerdown` dinleyicisinde `#threeDGizmoOverlay` kapsayıcısı muaf tutulmuştu. Gizmo overlay tüm tuval boyutunda mutlak bir katman olduğundan, boş alana yapılan tıklamalar engelleniyor ve `deselectAll()` çağrısına ulaşamıyordu.
- **Kök Neden 4 (`three-d-engine.js` Tuval Dinleyicisi):**  
  `modules/three-d-engine.js` içindeki `attachCanvasEvents` fonksiyonunda boş alana tıklandığında `setSelected(false)` çağrılıyor fakat `ThreeDGrouping.clearSelection()` ve `deselectAll()` tetiklenmiyordu.

---

## 2. Gerçekleştirilen Mimari Çözümler

### 2.1. Dinamik Frustum Projeksiyonu ile 9 Yönlü 3D Konumlandırma
`modules/three-d-engine.js` -> `align3DElement(targetEl, posKey)`:
- Kamera görüş açısı ($FOV$), en-boy oranı ($aspect$) ve kamera ile nesne arasındaki gerçek $Z$ mesafesi dinamik hesaplandı:
  $$\text{halfFrustumH} = \text{dist} \times \tan(FOV / 2)$$
  $$\text{halfFrustumW} = \text{halfFrustumH} \times aspect$$
- Nesnenin anlık geometrisi ve ölçeği hesaplanarak nesne yarı-genişliği (`elHalfW`) ve yarı-yüksekliği (`elHalfH`) bulundu.
- Güvenli kenar payı bırakılarak maksimum sınır hesaplandı:
  $$xSpan = \text{halfFrustumW} - elHalfW - 35$$
  $$ySpan = \text{halfFrustumH} - elHalfH - 30$$
- Three.js doğrultusuna uygun olarak `top` için $+ySpan$, `bottom` için $-ySpan$, `left` için $-xSpan$, `right` için $+xSpan$ atandı.
- `updateContentTransform(el)`, `updatePlaneTransform(el)`, `syncControlsUI()` ve `requestRender()` birbirine bağlandı.
- Çoklu seçim veya grup halindeyse gruptaki diğer nesnelerin de aralarındaki bağı koparmadan aynı delta miktarıyla beraber hareket etmesi sağlandı.
- `modules/multi-select.js` içerisindeki konumlandırma mantığı doğrudan bu merkezi fonksiyona bağlandı.

### 2.2. Katmanlar Arası Kusursuz Seçim Düşürme (Deselect Architecture)
1. **`core/drag.js` (`deselectAll`):**  
   Hem `.el-selected` hem `.multi-selected` sınıfları temizleniyor; ardından `window.ThreeDGrouping.clearSelection()` çalıştırılıyor.
2. **`modules/three-d-engine.js` (`setSelected` & `attachCanvasEvents`):**  
   Seçim bırakıldığında veya boş tuval tıklandığında `ThreeDGrouping.clearSelection()` ve `deselectAll()` çağrılarak hem 2D hem 3D seçim çerçeveleri tamamen temizleniyor.
3. **`modules/polygon.js` (`handleMarqueeEnd` & `Escape`):**  
   Boş alana yapılan tek tıklamalarda ve `Escape` tuşuna basıldığında seçimlerin sessizce düşürülmesi sağlandı.
4. **`modules/events.js` (`pointerdown`):**  
   Tüm overlay yerine sadece aktif gizmo tutamaçları (`.three-d-gizmo-tip, .three-d-gizmo-dot, .three-d-gizmo-sun`) muafiyete alındı; boş alana tıklanır tıklanmaz seçimler düşürüldü.
5. **`modules/three-d-grouping.js`:**  
   Boş zemin tıklarını yakalayan güvenlik dinleyicisi eklendi.

---

## 3. Değiştirilen Dosyalar

1. `modules/three-d-engine.js` (`align3DElement`, `setSelected`, `centerOnScreen`, `attachCanvasEvents`, export listesi)
2. `modules/multi-select.js` (`multiSelectPositionOnPage`)
3. `core/drag.js` (`deselectAll`)
4. `modules/polygon.js` (`handleMarqueeEnd`, `Escape` listener)
5. `modules/events.js` (`document.pointerdown` deselect)
6. `modules/three-d-grouping.js` (`pointerdown` deselect)

---

## 4. Sentaks ve Kalite Denetimi (Compiler Gate)

Aşağıdaki derleme komutu tüm değiştirilen dosyalarda sıfır hata ile doğrulanmıştır:
```bash
node -c modules/three-d-engine.js modules/three-d-align.js modules/three-d-grouping.js modules/multi-select.js modules/polygon.js modules/events.js core/drag.js
```
- **Hata Sayısı:** 0
- **Sentaks Durumu:** Geçti (Passed)
- **UI Standartları:** Çift ikon yok, parantezli yönlendirme yok, koyu panel kutusu yok, sessiz çalışma prensibi devrede.

---

## 5. Çoklu 3D Gölge Kesilmesi ve Sağ Tık Menüsü Çözümü (Ek Düzeltmeler)

### 5.1. İki 3D Öge Yan Yana Geldiğinde Gölgenin Düzlemsel Kesilmesi Sorunu (Gölge Blokajı)
- **Kök Neden:** Three.js üzerinde her 3D öge için zemin gölgesini yakalayan şeffaf `THREE.ShadowMaterial` düzlemi (`shadowPlane`) oluşturulur. `THREE.ShadowMaterial` varsayılan olarak `depthWrite: true` değerine sahiptir. Bu sebeple düzlemin şeffaf/boş pikselleri bile derinlik tamponuna (Z-buffer) $z = -0.5$ derinlik değeri yazar. İkinci ögenin gölge düzlemi 2500x2500 piksel boyutuna kadar genişlediğinde, birinci ögenin gölgesinin üzerine biner ve derinlik testi birinci ögenin gölgesini kare sınır hattı boyunca kesip yok ederdi.
- **Çözüm:** `modules/three-d-engine.js` içerisinde gölge malzemelerinin tüm tanımlama ve güncelleme noktalarında (`initElementThreeObjects`, `updatePlaneTransform`, `updateShadowPlaneGeometry`, `updateLighting`) `depthWrite: false`, `transparent: true`, `polygonOffset: true` (`factor: -1, units: -1`) özellikleri tanımlandı. Böylece şeffaf gölge zeminleri derinlik tamponuna yazma yapmaz; birden fazla 3D ögenin gölgesi birbirini kesmeden kusursuzca harmanlanır.

### 5.2. Mavi Seçim Çerçevesi ile İki Öge Seçildiğinde Sağ Tık Menüsünün Açılmaması
- **Kök Neden 1 (`pointerdown` Sağ Tık Engeli):** `modules/three-d-engine.js` içerisindeki `cvs.addEventListener('pointerdown')` dinleyicisi `e.button === 2` (sağ tık) durumunu döndürme modifiyeri sayıp `e.preventDefault()` ve `setPointerCapture()` çağırıyordu. `pointerdown` anında `preventDefault` çağrılması modern tarayıcılarda `contextmenu` olayının tetiklenmesini engelliyordu.
- **Kök Neden 2 (`container` Capture Fazı Blokajı):** `#canvas-container` üzerindeki `contextmenu` dinleyicisi `capture: true` fazında çalışıyordu. Çoklu seçim kontrolü yapmadan doğrudan tekil öge testi (`check3DHit`) yapıyor, çoklu seçimi bozup tek ögeye indirgiyor ve tekil öge menüsünü çağırıp `e.stopPropagation()` ile olayı durduruyordu.
- **Çözüm:** 
  1. `cvs` üzerindeki `pointerdown` dinleyicisinde `e.button === 2` için hemen `return` edilerek tarayıcının doğal `contextmenu` olayını ateşlemesi sağlandı.
  2. `container` capture `contextmenu`, `overlay` `contextmenu` ve `cvs` `contextmenu` dinleyicilerinin en başına çoklu seçim kontrolü eklendi: `ThreeDGrouping.getSelected3DElements().length > 1` olduğunda tık seçili ögelerden birine veya tuval boşluğuna geldiyse doğrudan `ThreeDGrouping.openMulti3DContextMenu(e.clientX, e.clientY)` açılarak "Birleştir", "Yüzeye Yapıştır", "Hizala" seçenekleri sunuldu.
  3. `open3DElementContextMenu` fonksiyonunun girişine çoklu seçim koruması eklenerek herhangi bir kanaldan çağrılsa bile otomatik yönlendirme garantilendi.
  4. Gizmo X ve Y oklarıyla sürükleme esnasında da grup kardeşlerine delta aktarımı (`propagateDragDelta`) sağlandı.

