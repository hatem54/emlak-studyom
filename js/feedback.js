// Feedback Modal and Logic
function initFeedbackSystem() {
    if (document.getElementById('feedbackModal')) return; // Zaten varsa ekleme
    
    const modalHTML = 
    <div class="modal-overlay" id="feedbackModal" style="display:none; z-index: 100000; align-items:center; justify-content:center; background: rgba(0,0,0,0.6);">
        <div class="modal" style="max-width: 400px; text-align:left; background: #0f172a; padding: 25px; border-radius: 12px; border: 1px solid #334155; position:relative; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <button class="modal-close" onclick="document.getElementById('feedbackModal').style.display='none'" style="position:absolute; right:15px; top:15px; background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer;"><i class="fas fa-times"></i></button>
            <h2 style="margin-bottom: 10px; color:white; font-size:22px; display:flex; align-items:center; gap:8px;">💬 Bize Ulaşın</h2>
            <p style="font-size: 13px; color: #94a3b8; margin-bottom: 20px;">Sorularınız, önerileriniz veya karşılaştığınız sorunlar için bize mesaj gönderin. Veya <a href="mailto:iletisim@emlakstudyom.com" style="color:#60a5fa; text-decoration:underline;">doğrudan e-posta</a> atın.</p>
            
            <form id="feedbackForm" onsubmit="submitFeedback(event)">
                <div class="form-group" style="margin-bottom:15px;">
                    <label style="display:block; color:#cbd5e1; font-size:13px; margin-bottom:6px;">E-posta Adresiniz</label>
                    <input type="email" id="feedbackEmail" placeholder="ornek@email.com" required style="width:100%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 8px; box-sizing:border-box;">
                </div>
                <div class="form-group" style="margin-bottom:15px;">
                    <label style="display:block; color:#cbd5e1; font-size:13px; margin-bottom:6px;">Mesajınız</label>
                    <textarea id="feedbackMessage" rows="4" placeholder="Size nasıl yardımcı olabiliriz?" required style="background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 8px; width: 100%; box-sizing:border-box; resize: vertical; font-family:inherit;"></textarea>
                </div>
                <div class="form-group" style="margin-bottom:20px;">
                    <label style="display:block; color:#cbd5e1; font-size:13px; margin-bottom:6px;">Deneyiminizi Puanlayın (Opsiyonel)</label>
                    <div style="font-size: 24px; cursor: pointer; display:flex; gap:8px;" id="feedbackRating">
                        <span onclick="setFeedbackRating(1)">⭐</span>
                        <span onclick="setFeedbackRating(2)">⭐</span>
                        <span onclick="setFeedbackRating(3)">⭐</span>
                        <span onclick="setFeedbackRating(4)">⭐</span>
                        <span onclick="setFeedbackRating(5)">⭐</span>
                    </div>
                    <input type="hidden" id="feedbackScore" value="5">
                </div>
                <button type="submit" class="btn-submit" id="feedbackSubmitBtn" style="width:100%; background:linear-gradient(135deg,#3b82f6,#2563eb); color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:15px;">Mesajı Gönder</button>
            </form>
        </div>
    </div>;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Yüklendiğinde direkt 5 yıldız seçili gelsin
    setTimeout(() => {
        setFeedbackRating(5);
    }, 100);
}

window.setFeedbackRating = function(score) {
    const scoreInput = document.getElementById('feedbackScore');
    if(scoreInput) scoreInput.value = score;
    
    const ratingDiv = document.getElementById('feedbackRating');
    if(ratingDiv) {
        const stars = ratingDiv.children;
        for(let i=0; i<5; i++) {
            stars[i].style.opacity = i < score ? '1' : '0.3';
            stars[i].style.filter = i < score ? 'grayscale(0%)' : 'grayscale(100%)';
        }
    }
}

window.openFeedbackModal = function() {
    if (!document.getElementById('feedbackModal')) {
        initFeedbackSystem();
    }
    const currentUser = window.CURRENT_USER;
    if (currentUser && currentUser.email) {
        document.getElementById('feedbackEmail').value = currentUser.email;
    }
    document.getElementById('feedbackModal').style.display = 'flex';
}

window.submitFeedback = async function(e) {
    e.preventDefault();
    const btn = document.getElementById('feedbackSubmitBtn');
    const originalText = btn.textContent;
    btn.textContent = 'Gönderiliyor...';
    btn.disabled = true;

    try {
        const email = document.getElementById('feedbackEmail').value;
        const message = document.getElementById('feedbackMessage').value;
        const rating = parseInt(document.getElementById('feedbackScore').value);
        
        const currentUser = window.CURRENT_USER;
        const userId = currentUser ? currentUser.id : null;

        if (!window.supabaseClient) throw new Error('Veritabanı bağlantısı yok.');

        const { error } = await window.supabaseClient.from('feedback').insert([{
            user_id: userId,
            user_email: email,
            message: message,
            rating: rating
        }]);

        if (error) {
            // Eğer tablo yoksa (kullanıcı henüz SQL çalıştırmadıysa)
            if (error.code === '42P01') {
                 throw new Error('Sistem kurulum aşamasındadır, mesajlar geçici olarak e-posta ile alınmaktadır. Lütfen formun üstündeki linkten e-posta atınız.');
            }
            throw error;
        }

        document.getElementById('feedbackModal').style.display = 'none';
        document.getElementById('feedbackMessage').value = '';
        
        if(typeof Swal !== 'undefined') {
            Swal.fire({icon: 'success', title: 'Teşekkürler!', text: 'Mesajınız başarıyla iletildi. En kısa sürede dönüş yapacağız.', background: '#1e293b', color: '#fff'});
        } else {
            alert('Mesajınız başarıyla iletildi. Teşekkür ederiz!');
        }
    } catch(err) {
        console.error('Feedback error:', err);
        if(typeof Swal !== 'undefined') {
            Swal.fire({icon: 'error', title: 'Hata', text: err.message || 'Mesaj gönderilemedi.', background: '#1e293b', color: '#fff'});
        } else {
            alert('Hata: ' + (err.message || 'Mesaj gönderilemedi.'));
        }
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', initFeedbackSystem);
    if (window.location.pathname.includes('app.html')) {
        const floatBtn = \<button onclick="openFeedbackModal()" style="position:fixed; bottom:20px; right:20px; background:linear-gradient(135deg,#3b82f6,#2563eb); color:white; border:none; padding:12px 20px; border-radius:30px; font-weight:bold; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.3); z-index:9999; display:flex; align-items:center; gap:8px;">💬 Bize Ulaşın</button>\;
        document.body.insertAdjacentHTML('beforeend', floatBtn);
    }
