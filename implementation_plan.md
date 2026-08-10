# Export Katman Mimarisinin (Sandwich Render) Uygulanmasi

## Mevcut Sorun
Lüks şablon haricindeki şablonlarda (Minimal, Klasik vb.) export.js, html2canvas'ın fotoğrafı örtmesini engellemek için şablon arkaplanlarını 	ransparent yapmakta, bu da CSS gradient/desen içeren arka planların export dosyasında tamamen kaybolmasına neden olmaktadır.

## Çözüm Mimari: 3 Katmanlı (Sandwich) Render Algoritması
Sorunu çözmek için saveImage() ve startBatchExport() fonksiyonlarındaki tek seferlik html2canvas çağrısını 3 aşamalı bir çizim sırasına oturtacağız. Z-index çatışmalarını engellemek için DOM'un görsel durumunu anlık olarak manipüle edip (Ghost Mode) iki ayrı html2canvas okuması yapacağız.

### Çizim (Render) Sırası:
1. **Pass 1 (Arka Plan - bgCanvas):** .draggable (yazı/ikon) ve photo-panel elemanları yoksayılarak sadece şablonun zemin arka planları ve sabit dekoratif şekilleri html2canvas ile çekilip inalCanvas'a çizilir.
2. **Pass 2 (Native Fotoğraf):** Yüksek çözünürlüklü asıl emlak fotoğrafı (c), tam koordinatlarına inalCanvas üzerine çizilir. Bu işlem arka planın üzerini örterken, kalite kaybını önler.
3. **Pass 3 (UI / Metin - uiCanvas):** Şablondaki tüm yapısal elemanların (container'ların) arka planları, kenarlıkları ve gölgeleri anlık olarak "şeffaf (transparent)" yapılır (Ghost Mode). Sadece .draggable sınıfına sahip metinler, logolar ve ikonlar görünür bırakılır. html2canvas ile alınan bu şeffaf katman en üste çizilir.

## User Review Required
> [!IMPORTANT]  
> Bu algoritma hem saveImage hem de startBatchExport için ortak olarak uygulanacaktır. Çift html2canvas çağrısı, export süresini 0.5 - 1 saniye kadar uzatabilir ancak tüm şablonlarda arka planların ve metin sıralamasının %100 doğru çıkmasını garanti eder.

## Proposed Changes

### modules/export.js
#### [MODIFY] modules/export.js
- saveImage() ve startBatchExport() içindeki mevcut tekil html2canvas (sourceCanvas) bloğu silinecek.
- Yerine yukarıda açıklanan 3 aşamalı çizim mantığı (Pass 1, Native, Pass 3) eklenecek.
- Ghost Mode için swapStyles mekanizması tüm DOM ağacını (sadece canvasEl içindekileri) tarayarak yapısal elemanları gizleyecek, .draggable elemanları koruyacak şekilde güncellenecek.

## Verification Plan
### Manual Verification
- Kullanıcıdan Minimal ve Klasik şablonlarda Seçili Formatta İndir butonuna basması istenecek.
- İndirilen resimde hem CSS gradient arka planının, hem yüksek çözünürlüklü emlak fotoğrafının, hem de fotoğrafın üzerine binen metinlerin eksiksiz ve doğru sırada olduğu teyit edilecek.
