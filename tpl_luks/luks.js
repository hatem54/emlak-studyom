/* ============================================================
   Lüks Şablon Seti - HIGH END
   10 Adet Ultra Premium Tasarım (High Detail)
============================================================ */

function _luksInit(){
    const container = document.getElementById('tpl-content-luks');
    if(!container) {
        setTimeout(_luksInit, 500);
        return;
    }
    
    container.innerHTML = `
        <div class="edit-hint">💡 Yazıya/panele ÇİFT TIKLA | Sürükle Bırak | Sağ Tık (Ayarlar)</div>
        <div class="template-grid" id="luksTemplateGrid" style="margin-top:10px;"></div>
        <div class="section-title">💎 Lüks Tasarımlar (Aşırı Detaylı)</div>
        <div class="section-title" style="margin-top:0">⚡ Hızlı Metin Düzenleyici</div>
        
        <div class="input-group">
            <label>Ana Başlık (Title)</label>
            <input type="text" id="canvaLTitle" value="SATILIK MÜSTAKİL EV">
        </div>
        <div class="input-group">
            <label>Fiyat</label>
            <input type="text" id="canvaLPrice" value="12.500.000 TL">
        </div>
        <div class="input-group">
            <label>Marka / İletişim</label>
            <input type="text" id="canvaLContact" value="EMLAK STUDIO | 0532 000 0000">
        </div>
        <div class="input-group">
            <label>Özellikler (Alt alta)</label>
            <textarea id="canvaLFeats" rows="4">Geniş Bahçe
Müstakil Havuz
Doğa İçinde
Özel Otopark</textarea>
        </div>
        <button class="btn-action btn-green" onclick="var b=document.querySelector('#luksTemplateGrid .template-btn.active'); if(b){b.classList.remove('active'); b.click();}">🎯 Seçili Şablonu Uygula</button>

        
    `;

    const grid = document.getElementById('luksTemplateGrid');
    
    // Varsayılanları yükle
    const lsTitle = localStorage.getItem('canvaLTitle');
    const lsPrice = localStorage.getItem('canvaLPrice');
    const lsFeats = localStorage.getItem('canvaLFeats');
    
    if(lsTitle) document.getElementById('canvaLTitle').value = lsTitle;
    if(lsPrice) document.getElementById('canvaLPrice').value = lsPrice;
    if(lsFeats) document.getElementById('canvaLFeats').value = lsFeats;

    const variations = [{"html":"<div class=\"cvr-base\" style=\"width:100%;height:100%;position:relative;overflow:hidden;background:#0d2d1f;font-family:Playfair Display,sans-serif;\"><div class=\"photo-panel\" style=\"width:${scaleX(1000)}px;height:100%;position:absolute;right:0;top:0;${bgPos};border-left:8px solid #cfb53b;\"></div><div style=\"position:absolute;left:0;top:0;width:${scaleX(600)}px;height:100%;padding:${scaleY(60)}px ${scaleX(40)}px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;background:linear-gradient(135deg, #0d2d1f 0%, #06170f 100%);\"><div style=\"font-size:${scaleMin(28)}px;color:#cfb53b;text-transform:uppercase;letter-spacing:4px;margin-bottom:${scaleY(10)}px;font-family:Montserrat,sans-serif;\">GAYRİMENKUL</div><div style=\"font-size:${scaleMin(60)}px;color:#fff;font-weight:700;line-height:1.2;margin-bottom:${scaleY(20)}px;text-shadow:2px 2px 4px rgba(0,0,0,0.5);\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${title}</span></div><div style=\"width:100%;height:2px;background:#cfb53b;margin-bottom:${scaleY(30)}px;\"></div><div style=\"font-size:${scaleMin(50)}px;color:#cfb53b;font-weight:900;margin-bottom:${scaleY(40)}px;font-family:Montserrat,sans-serif;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${price}</span></div><div style=\"background:rgba(207, 181, 59, 0.1);border:1px solid #cfb53b;padding:${scaleY(30)}px;border-radius:15px;\"><div style=\"font-size:${scaleMin(24)}px;color:#cfb53b;margin-bottom:${scaleY(20)}px;font-weight:bold;text-transform:uppercase;\">Özellikler</div><div style=\"font-size:${scaleMin(20)}px;color:#e2e8f0;font-family:Montserrat,sans-serif;line-height:2.2;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;white-space:pre-wrap;\">✓ ${feats.replace(/\\n/g, \"\\n✓ \")}</span></div></div><div style=\"margin-top:auto;padding-top:${scaleY(30)}px;display:flex;align-items:center;gap:15px;border-top:1px dashed rgba(207, 181, 59, 0.5);\"><div style=\"width:30px;height:30px;border-radius:50%;background:#cfb53b;display:flex;align-items:center;justify-content:center;color:#0d2d1f;font-weight:bold;font-family:sans-serif;\">i</div><div style=\"color:#cfb53b;font-size:${scaleMin(18)}px;font-family:Montserrat,sans-serif;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">İletişim için arayınız</span></div></div></div></div>"},{"html":"<div class=\"cvr-base\" style=\"width:100%;height:100%;position:relative;overflow:hidden;background:#112244;font-family:Playfair Display,sans-serif;\"><div class=\"photo-panel\" style=\"width:100%;height:${scaleY(800)}px;position:absolute;left:0;top:0;${bgPos};border-bottom:10px solid #d4af37;\"></div><div style=\"position:absolute;left:0;bottom:0;width:100%;height:${scaleY(400)}px;padding:${scaleY(40)}px ${scaleX(60)}px;box-sizing:border-box;display:flex;flex-direction:column;background:#112244;\"><div style=\"display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:${scaleY(30)}px;border-bottom:2px solid rgba(212, 175, 55, 0.3);padding-bottom:${scaleY(20)}px;\"><div><div style=\"font-size:${scaleMin(22)}px;color:#d4af37;font-family:Montserrat,sans-serif;margin-bottom:${scaleY(5)}px;text-transform:uppercase;letter-spacing:2px;\">ÖZEL PORTFÖY</div><div style=\"font-size:${scaleMin(55)}px;color:#fff;font-weight:700;line-height:1;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${title}</span></div></div><div style=\"font-size:${scaleMin(45)}px;color:#d4af37;font-weight:bold;font-family:Montserrat,sans-serif;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${price}</span></div></div><div style=\"display:flex;gap:${scaleX(40)}px;\"><div style=\"flex:1;background:rgba(212, 175, 55, 0.05);padding:${scaleY(20)}px;border-radius:10px;border-left:4px solid #d4af37;\"><div style=\"font-size:${scaleMin(18)}px;color:#d4af37;font-family:Montserrat,sans-serif;line-height:1.8;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;white-space:pre-wrap;\">${feats}</span></div></div><div style=\"flex:1;background:rgba(212, 175, 55, 0.05);padding:${scaleY(20)}px;border-radius:10px;display:flex;flex-direction:column;justify-content:center;\"><div style=\"font-size:${scaleMin(20)}px;color:#fff;font-family:Montserrat,sans-serif;text-align:center;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">Merkezi Konum<br>Yüksek Yatırım Değeri<br>Hemen Teslim</span></div></div></div></div></div>"},{"html":"<div class=\"cvr-base\" style=\"width:100%;height:100%;position:relative;overflow:hidden;background:#000;font-family:Playfair Display,sans-serif;\"><div class=\"photo-panel\" style=\"width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};\"></div><div style=\"position:absolute;left:${scaleX(80)}px;top:${scaleY(80)}px;width:calc(100% - ${scaleX(160)}px);height:calc(100% - ${scaleY(160)}px);border:3px solid #d4af37;border-radius:20px;box-sizing:border-box;\"></div><div style=\"position:absolute;left:${scaleX(110)}px;top:${scaleY(110)}px;width:calc(100% - ${scaleX(220)}px);height:calc(100% - ${scaleY(220)}px);border:1px solid rgba(212, 175, 55, 0.5);border-radius:15px;box-sizing:border-box;\"></div><div style=\"position:absolute;left:50%;top:50%;transform:translate(-50%, -50%);background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);padding:${scaleY(60)}px ${scaleX(80)}px;border-radius:20px;border-top:5px solid #d4af37;border-bottom:5px solid #d4af37;text-align:center;width:${scaleX(1000)}px;box-shadow:0 25px 50px rgba(0,0,0,0.5);\"><div style=\"font-size:${scaleMin(24)}px;color:#d4af37;text-transform:uppercase;letter-spacing:6px;margin-bottom:${scaleY(20)}px;font-family:Montserrat,sans-serif;\">PREMIUM EMLAK</div><div style=\"font-size:${scaleMin(70)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(30)}px;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${title}</span></div><div style=\"font-size:${scaleMin(45)}px;color:#d4af37;font-family:Montserrat,sans-serif;margin-bottom:${scaleY(40)}px;font-weight:600;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${price}</span></div><div style=\"width:${scaleX(200)}px;height:2px;background:#d4af37;margin:0 auto ${scaleY(40)}px auto;\"></div><div style=\"font-size:${scaleMin(22)}px;color:#e2e8f0;font-family:Montserrat,sans-serif;line-height:2;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;white-space:pre-wrap;\">${feats.split(\"\\n\").join(\"  |  \")}</span></div></div></div>"},{"html":"<div class=\"cvr-base\" style=\"width:100%;height:100%;position:relative;overflow:hidden;background:#4a0e1c;font-family:Playfair Display,sans-serif;\"><div class=\"photo-panel\" style=\"width:${scaleX(1100)}px;height:100%;position:absolute;left:0;top:0;${bgPos};border-right:8px solid #d4af37;\"></div><div style=\"position:absolute;right:0;top:0;width:${scaleX(500)}px;height:100%;padding:${scaleY(80)}px ${scaleX(40)}px;box-sizing:border-box;display:flex;flex-direction:column;text-align:center;\"><div style=\"width:60px;height:60px;border:2px solid #d4af37;border-radius:50%;margin:0 auto ${scaleY(30)}px auto;display:flex;align-items:center;justify-content:center;color:#d4af37;font-size:30px;\">★</div><div style=\"font-size:${scaleMin(20)}px;color:#d4af37;text-transform:uppercase;letter-spacing:3px;margin-bottom:${scaleY(20)}px;font-family:Montserrat,sans-serif;\">Exclusive</div><div style=\"font-size:${scaleMin(50)}px;color:#fff;font-weight:700;line-height:1.2;margin-bottom:${scaleY(30)}px;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${title}</span></div><div style=\"font-size:${scaleMin(35)}px;color:#d4af37;font-weight:bold;margin-bottom:${scaleY(50)}px;font-family:Montserrat,sans-serif;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${price}</span></div><div style=\"background:rgba(0,0,0,0.2);padding:${scaleY(30)}px ${scaleX(20)}px;border-radius:10px;text-align:left;\"><div style=\"font-size:${scaleMin(18)}px;color:#e2e8f0;font-family:Montserrat,sans-serif;line-height:2.5;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;white-space:pre-wrap;\">🔹 ${feats.replace(/\\n/g, \"\\n🔹 \")}</span></div></div></div></div>"},{"html":"<div class=\"cvr-base\" style=\"width:100%;height:100%;position:relative;overflow:hidden;background:linear-gradient(135deg, #022c22 0%, #047857 100%);font-family:Playfair Display,sans-serif;\">\n    <div class=\"photo-panel\" style=\"width:${scaleX(1200)}px;height:100%;position:absolute;right:0;top:0;${bgPos};\"></div>\n    \n    <div style=\"position:absolute;left:${scaleX(60)}px;top:${scaleY(60)}px;width:calc(100% - ${scaleX(120)}px);height:calc(100% - ${scaleY(120)}px);border:1px solid rgba(252, 211, 77, 0.3);box-sizing:border-box;pointer-events:none;\"></div>\n    <div style=\"position:absolute;left:${scaleX(80)}px;top:${scaleY(80)}px;width:calc(100% - ${scaleX(160)}px);height:calc(100% - ${scaleY(160)}px);border:2px solid rgba(252, 211, 77, 0.6);box-sizing:border-box;pointer-events:none;\"></div>\n\n    <div style=\"position:absolute;left:${scaleX(120)}px;top:50%;transform:translateY(-50%);width:${scaleX(850)}px;display:flex;flex-direction:column;z-index:10;\">\n        <div style=\"display:flex;align-items:center;gap:15px;margin-bottom:${scaleY(30)}px;\">\n            <div style=\"width:${scaleX(60)}px;height:2px;background:#fcd34d;\"></div>\n            <div style=\"font-size:${scaleMin(20)}px;color:#fcd34d;font-family:Montserrat,sans-serif;text-transform:uppercase;letter-spacing:4px;\">PRO LÜKS SERİSİ</div>\n        </div>\n        \n        <div style=\"font-size:${scaleMin(75)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(20)}px;text-shadow:0 10px 30px rgba(0,0,0,0.5);\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${title}</span></div>\n        \n        <div style=\"font-size:${scaleMin(45)}px;color:#fcd34d;font-family:Montserrat,sans-serif;font-weight:300;margin-bottom:${scaleY(50)}px;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${price}</span></div>\n        \n        <div style=\"background:rgba(2, 44, 34, 0.95);padding:${scaleY(40)}px;border-left:4px solid #fcd34d;border-radius:0 20px 20px 0;box-shadow:0 20px 40px rgba(0,0,0,0.5);\">\n            <div style=\"font-size:${scaleMin(20)}px;color:#e2e8f0;font-family:Montserrat,sans-serif;line-height:2.5;\">\n                <span class=\"editable-text\" style=\"display:inline-block;min-width:50px;white-space:pre-wrap;\">❖ ${feats.split(\"\\n\").join(\"\\n❖ \")}</span>\n            </div>\n        </div>\n    </div>\n</div>"},{"html":"<div class=\"cvr-base\" style=\"width:100%;height:100%;position:relative;overflow:hidden;background:#27272a;font-family:Playfair Display,sans-serif;\"><div class=\"photo-panel\" style=\"width:100%;height:${scaleY(850)}px;position:absolute;left:0;top:0;${bgPos};\"></div><div style=\"position:absolute;bottom:0;left:0;width:100%;height:${scaleY(350)}px;background:#27272a;border-top:6px solid #b76e79;display:flex;align-items:center;padding:0 ${scaleX(80)}px;box-sizing:border-box;\"><div style=\"flex:1.5;\"><div style=\"font-size:${scaleMin(60)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(15)}px;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${title}</span></div><div style=\"font-size:${scaleMin(40)}px;color:#b76e79;font-family:Montserrat,sans-serif;font-weight:bold;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${price}</span></div></div><div style=\"width:2px;height:${scaleY(200)}px;background:rgba(183, 110, 121, 0.3);margin:0 ${scaleX(50)}px;\"></div><div style=\"flex:1;\"><div style=\"font-size:${scaleMin(20)}px;color:#e2e8f0;font-family:Montserrat,sans-serif;line-height:2;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;white-space:pre-wrap;\">${feats}</span></div></div></div><div style=\"position:absolute;top:${scaleY(50)}px;right:${scaleX(50)}px;background:rgba(39, 39, 42, 0.9);color:#b76e79;padding:${scaleY(15)}px ${scaleX(30)}px;border-radius:30px;font-size:${scaleMin(20)}px;font-family:Montserrat,sans-serif;font-weight:bold;border:1px solid #b76e79;\">ÖZEL TEKLİF</div></div>"},{"html":"<div class=\"cvr-base\" style=\"width:100%;height:100%;position:relative;overflow:hidden;background:#0f172a;font-family:Playfair Display,sans-serif;\"><div class=\"photo-panel\" style=\"width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};\"></div><div style=\"position:absolute;left:${scaleX(60)}px;top:${scaleY(60)}px;width:${scaleX(550)}px;height:${scaleY(1080)}px;background:#0f172a;border-radius:20px;box-shadow:20px 20px 60px rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.1);padding:${scaleY(60)}px ${scaleX(40)}px;box-sizing:border-box;display:flex;flex-direction:column;\"><div style=\"width:100%;height:${scaleY(150)}px;border:1px solid #d4af37;border-radius:10px;margin-bottom:${scaleY(40)}px;display:flex;align-items:center;justify-content:center;color:#d4af37;font-size:${scaleMin(24)}px;font-family:Montserrat,sans-serif;text-align:center;padding:20px;box-sizing:border-box;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">LUXURY<br>COLLECTION</span></div><div style=\"font-size:${scaleMin(50)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(30)}px;text-align:center;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${title}</span></div><div style=\"font-size:${scaleMin(40)}px;color:#d4af37;font-weight:bold;margin-bottom:${scaleY(40)}px;text-align:center;font-family:Montserrat,sans-serif;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${price}</span></div><div style=\"font-size:${scaleMin(18)}px;color:#cbd5e1;font-family:Montserrat,sans-serif;line-height:2.2;background:rgba(255,255,255,0.03);padding:${scaleY(30)}px;border-radius:15px;border-left:4px solid #d4af37;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;white-space:pre-wrap;\">${feats}</span></div></div></div>"},{"html":"<div class=\"cvr-base\" style=\"width:100%;height:100%;position:relative;overflow:hidden;background:#1e293b;font-family:Playfair Display,sans-serif;\"><div class=\"photo-panel\" style=\"width:${scaleX(1500)}px;height:${scaleY(1100)}px;position:absolute;right:0;bottom:0;${bgPos};\"></div><div style=\"position:absolute;left:0;top:0;width:${scaleX(800)}px;height:${scaleY(800)}px;background:#1e293b;clip-path:polygon(0 0, 100% 0, 0 100%);\"></div><div style=\"position:absolute;left:${scaleX(60)}px;top:${scaleY(80)}px;width:${scaleX(600)}px;\"><div style=\"font-size:${scaleMin(20)}px;color:#d4af37;font-family:Montserrat,sans-serif;letter-spacing:5px;margin-bottom:${scaleY(20)}px;text-transform:uppercase;\">Yeni Fırsat</div><div style=\"font-size:${scaleMin(65)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(30)}px;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${title}</span></div><div style=\"font-size:${scaleMin(45)}px;color:#d4af37;font-family:Montserrat,sans-serif;font-weight:bold;margin-bottom:${scaleY(40)}px;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${price}</span></div><div style=\"font-size:${scaleMin(18)}px;color:#e2e8f0;font-family:Montserrat,sans-serif;line-height:2;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;white-space:pre-wrap;\">${feats}</span></div></div></div>"},{"html":"<div class=\"cvr-base\" style=\"width:100%;height:100%;position:relative;overflow:hidden;background:#172554;font-family:Playfair Display,sans-serif;\"><div class=\"photo-panel\" style=\"width:100%;height:${scaleY(700)}px;position:absolute;left:0;top:0;${bgPos};\"></div><div style=\"position:absolute;left:0;bottom:0;width:100%;height:${scaleY(500)}px;display:flex;\"><div style=\"flex:1;background:#1e3a8a;padding:${scaleY(60)}px;box-sizing:border-box;border-top:8px solid #e5e7eb;\"><div style=\"font-size:${scaleMin(60)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(20)}px;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${title}</span></div><div style=\"font-size:${scaleMin(40)}px;color:#e5e7eb;font-family:Montserrat,sans-serif;font-weight:bold;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${price}</span></div></div><div style=\"flex:1;background:#172554;padding:${scaleY(60)}px;box-sizing:border-box;border-top:8px solid #94a3b8;display:flex;align-items:center;\"><div style=\"font-size:${scaleMin(22)}px;color:#cbd5e1;font-family:Montserrat,sans-serif;line-height:2.2;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;white-space:pre-wrap;\">${feats}</span></div></div></div></div>"},{"html":"<div class=\"cvr-base\" style=\"width:100%;height:100%;position:relative;overflow:hidden;background:#0d2d1f;font-family:Playfair Display,sans-serif;\"><div class=\"photo-panel\" style=\"width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};\"></div><div style=\"position:absolute;left:50%;bottom:${scaleY(60)}px;transform:translateX(-50%);width:${scaleX(1400)}px;background:#0d2d1f;border:2px solid #cfb53b;padding:${scaleY(40)}px ${scaleX(60)}px;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;border-radius:15px;box-shadow:0 30px 60px rgba(0,0,0,0.5);\"><div style=\"flex:2;\"><div style=\"font-size:${scaleMin(20)}px;color:#cfb53b;font-family:Montserrat,sans-serif;text-transform:uppercase;letter-spacing:3px;margin-bottom:${scaleY(10)}px;\">Yüksek Yaşam Standartları</div><div style=\"font-size:${scaleMin(55)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(15)}px;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${title}</span></div><div style=\"font-size:${scaleMin(40)}px;color:#cfb53b;font-family:Montserrat,sans-serif;font-weight:bold;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;\">${price}</span></div></div><div style=\"width:2px;height:${scaleY(150)}px;background:rgba(207,181,59,0.3);margin:0 ${scaleX(40)}px;\"></div><div style=\"flex:1;\"><div style=\"font-size:${scaleMin(18)}px;color:#e2e8f0;font-family:Montserrat,sans-serif;line-height:2;\"><span class=\"editable-text\" style=\"display:inline-block;min-width:50px;white-space:pre-wrap;\">${feats.split(\"\\n\").slice(0,4).join(\"\\n\")}</span></div></div></div><div style=\"position:absolute;top:0;left:${scaleX(60)}px;background:#cfb53b;color:#0d2d1f;padding:${scaleY(20)}px ${scaleX(30)}px;font-size:${scaleMin(24)}px;font-weight:bold;border-radius:0 0 15px 15px;\">ÖZEL LİSTE</div></div>"}];
    
    variations.forEach((v, idx) => {
        const btn = document.createElement('button');
        btn.className = 'template-btn';
        btn.innerHTML = `
            <div class="pro-badge">PRO</div>
            YENİ LÜKS ${idx+1}
        `;
        btn.onclick = () => {
            if(btn.classList.contains('active')) return;
            document.querySelectorAll('#tpl-content-luks .template-btn').forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            renderLuksTemplate(v.html);
            
            // Seçimi kaydet
            localStorage.setItem('canvaActiveLuks', idx);
            // Kategori seçimi
            localStorage.setItem('canvaActiveCat', 'luks');
        };
        grid.appendChild(btn);
    });

    // Inputları dinle
    ['canvaLTitle','canvaLPrice','canvaLContact','canvaLFeats'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            const activeBtn = grid.querySelector('.template-btn.active');
            if(activeBtn) activeBtn.click();
            // LocalStorage güncelle
            localStorage.setItem(id, document.getElementById(id).value);
        });
    });

    // İlk şablonu otomatik açmayı kapattık çünkü sayfa yüklendiğinde şablonun ekrana gelmesini istemiyoruz
    const savedIdx = localStorage.getItem('canvaActiveLuks');
    if(savedIdx !== null && variations[savedIdx] && grid.children[savedIdx]) {
        grid.children[savedIdx].classList.add('active');
    }
}

function renderLuksTemplate(htmlString) {
    if(typeof _kolajTemizle === 'function') _kolajTemizle();
    document.querySelectorAll('.normal-el').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.canva-generated, .canva-panel').forEach(e => e.remove());
      var baseCanvas = document.getElementById('draw-layer');
      // if(baseCanvas) { var ctx = baseCanvas.getContext('2d'); ctx.clearRect(0,0,1920,1080); }
    document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
    photoLayer.style.display = 'none';
    canvaRenderLayer.style.display = 'block';
    isCanvaMode = true;
    
    const bgImg = uploadedImgUrl ? "background-image:url('" + uploadedImgUrl + "')" : "background-color:#94a3b8";
    
    const x = document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50;
    const y = document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50;
    const zoom = document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100;
    const sizeStr = zoom == 100 ? 'cover' : (zoom + '%');
    
    const bgPos = bgImg + ";background-position:" + x + "% " + y + "%;background-size:" + sizeStr + ";";

    const title = document.getElementById('canvaLTitle').value || 'Başlık';
    const price = document.getElementById('canvaLPrice').value || '';
    const contactEl = document.getElementById('canvaLContact');
    const contact = contactEl ? contactEl.value : '';
    const feats = document.getElementById('canvaLFeats').value || '';

    let parsedHtml = htmlString
        .replace(/\$\{bgPos\}/g, bgPos)
        .replace(/\$\{title\}/g, title)
        .replace(/\$\{price\}/g, price)
        .replace(/\$\{feats\}/g, feats)
        // Eğer js replace çağrıları varsa (template literal içindeki html stringinde) regex ile düzeltildi
        ;

    // Özel eval benzeri string değişimi (feats.replace...)
    // Çünkü JSON.stringify function stringlerini düzgün render etmiyor, replace'lerimizi template'lerde pre-evaluated yapmamız lazım
    // Yukarıda replace() fonksiyonlarını direkt JS'de çalıştırmak için template literal syntax'ına güvendik ama string olarak geldi!
    // Bu yüzden özellikler için bir fix:
    const featsLines = feats.split("\n");
    parsedHtml = parsedHtml.replace(/\$\{feats\.replace\(\/\\n\/g, \"\\n✓ \"\)\}/g, featsLines.join("\n✓ "));
    parsedHtml = parsedHtml.replace(/\$\{feats\.replace\(\/\\n\/g, \"\\n🔹 \"\)\}/g, featsLines.join("\n🔹 "));
    parsedHtml = parsedHtml.replace(/\$\{feats\.replace\(\/\\n\/g, \" &nbsp;\|&nbsp; \"\)\}/g, featsLines.join(" &nbsp;|&nbsp; "));
    parsedHtml = parsedHtml.replace(/\$\{feats\.split\(\"\\n\"\)\.join\(\"  \|  \"\)\}/g, featsLines.join("  |  "));
    parsedHtml = parsedHtml.replace(/\$\{feats\.split\(\"\\n\"\)\.join\(\"\\n❖ \"\)\}/g, featsLines.join("\n❖ "));
    parsedHtml = parsedHtml.replace(/\$\{feats\.split\(\"\\n\"\)\.slice\(0,4\)\.join\(\"\\n\"\)\}/g, featsLines.slice(0,4).join("\n"));

    const canvasSize = getCanvasSize();
    const fullW = canvasSize.w;
    const fullH = canvasSize.h;
    const scaleXFn = (val) => (val / 1920) * fullW;
    const scaleYFn = (val) => (val / 1080) * fullH;
    const scaleMin = (val) => val * Math.min(fullW/1920, fullH/1080);

    parsedHtml = parsedHtml.replace(/font-size:\$\{scaleY\((\d+)\)\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));
    parsedHtml = parsedHtml.replace(/font-size:\$\{scaleX\((\d+)\)\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));
    parsedHtml = parsedHtml.replace(/\$\{scaleX\((\d+)\)\}/g, (m, p1) => Math.round(scaleXFn(parseInt(p1, 10))));
    parsedHtml = parsedHtml.replace(/\$\{scaleY\((\d+)\)\}/g, (m, p1) => Math.round(scaleYFn(parseInt(p1, 10))));
    parsedHtml = parsedHtml.replace(/\$\{fullH\}/g, fullH);

    canvaRenderLayer.innerHTML = parsedHtml;
    canvaRenderLayer.querySelectorAll('.photo-panel').forEach(el => {
        if(typeof bindPhotoPanel === 'function') enablePhotoDrag(el);
    });
    canvaRenderLayer.querySelectorAll('.editable-text').forEach(el => enableInlineEdit(el));
    requestAnimationFrame(() => {
        if(typeof redrawAll === 'function') redrawAll();
    });
}

setTimeout(_luksInit, 200);
