---
name: emlak-ui-quality
description: >-
  Enforces Emlak Stüdyom UI design system standards, button rules, slider guidelines,
  and code quality checks. Use whenever creating or modifying UI elements, buttons,
  modals, sidebars, controls, or canvas toolbars in this project.
---

# Emlak Stüdyom Arayüz & Kalite Güvence Becerisi (UI Quality Skill)

Bu beceri, **Emlak Stüdyom** projesinde yapılan tüm arayüz, buton, slider ve JavaScript düzenlemelerinin [UI_DESIGN_SYSTEM.md](file:///c:/Users/Hatemi/Desktop/emlak%20d%C3%BCzenlemeleri%20i%C3%A7in%20uygulama/emlak-studiom%20v7-0/UI_DESIGN_SYSTEM.md) ve [AGENTS.md](file:///c:/Users/Hatemi/Desktop/emlak%20d%C3%BCzenlemeleri%20i%C3%A7in%20uygulama/emlak-studiom%20v7-0/AGENTS.md) standartlarına %100 uyumlu olmasını sağlar.

---

## 1. Temel Arayüz Kuralları (UI Design Rules)

1. **Tek İkon Kuralı:**
   - Bir butonda hem FontAwesome ikonu (`<i class="fa-solid ..."></i>`) hem de emoji ASLA bir arada kullanılmaz.
   - Sadece tek bir ikon veya tek bir emoji tercih edilir.

2. **Parantez İçi Açıklama Yasağı:**
   - Buton metinlerinin sonuna parantez içi yönlendirme yazılmaz (`(Adım Adım Düzenle)`, `(Geçici)` vb. yasaktır).
   - Açıklamalar butonun `title="..."` özelliğine yazılmalıdır.

3. **Yan Panelde Koyu Dolgulu Kutu / Kart Yasağı:**
   - Yan panellerde uygulamanın açık temasını bozan koyu renkli, ağır dolgulu ayrı kutular (`background: rgba(15, 23, 42, ...)`) yapılmaz.
   - Kontroller panel zeminine doğal şekilde hafif kenarlıklarla oturur.

4. **Slider Altı Kolay Erişim / Preset Butonu Yasağı:**
   - Sliderların altına veya yanına `%50`, `%80`, `%100` gibi hazır değer butonları konulmaz. Değer seçimi doğrudan slider üzerinden yapılır.

5. **Dinamik Event Listener Hijyeni:**
   - Global `mousemove` ve `touchmove` dinleyicileri yalnızca `mousedown` anında bağlanmalı, `mouseup` anında mutlaka `removeEventListener` ile temizlenmelidir.

---

## 2. Otomatik Doğrulama Adımı

Herhangi bir arayüz veya kod dosyasında değişiklik yapıldıktan sonra yerel doğrulama scripti çalıştırılabilir:

```bash
node .agents/skills/emlak-ui-quality/scripts/verify_ui.js <değiştirilen-dosya-yolu>
```

Tüm kurallar ve tasarım belirteçleri için her zaman [UI_DESIGN_SYSTEM.md](file:///c:/Users/Hatemi/Desktop/emlak%20d%C3%BCzenlemeleri%20i%C3%A7in%20uygulama/emlak-studiom%20v7-0/UI_DESIGN_SYSTEM.md) belgesi referans alınır.
