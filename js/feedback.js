// Feedback Modal and Logic
function initFeedbackSystem() {
    if (document.getElementById('feedbackModal')) return;
    
    const modalHTML = `
    <div class="modal-overlay" id="feedbackModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; z-index: 100000; align-items:center; justify-content:center; background: rgba(0,0,0,0.7);">
        <div class="modal" style="max-width: 400px; width:90%; text-align:left; background: #0f172a; padding: 25px; border-radius: 12px; border: 1px solid #334155; position:relative; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 100001;">
            <button type="button" class="modal-close" onclick="window.closeFeedbackModal()" style="position:absolute; right:15px; top:15px; background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer;">&times;</button>
            <h2 style="margin-bottom: 10px; color:white; font-size:22px; display:flex; align-items:center; gap:8px;">💬 Bize Ulaşın</h2>
            <p style="font-size: 13px; color: #94a3b8; margin-bottom: 20px;">Sorularınız, önerileriniz veya karşılaştığınız sorunlar için bize mesaj gönderin. Veya <a href="mailto:iletisim@emlakstudyom.com" style="color:#60a5fa; text-decoration:underline;">doğrudan e-posta</a> atın.</p>
            
            <form id="feedbackForm" onsubmit="window.submitFeedback(event)">
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
                        <span onclick="window.setFeedbackRating(1)">⭐</span>
                        <span onclick="window.setFeedbackRating(2)">⭐</span>
                        <span onclick="window.setFeedbackRating(3)">⭐</span>
                        <span onclick="window.setFeedbackRating(4)">⭐</span>
                        <span onclick="window.setFeedbackRating(5)">⭐</span>
                    </div>
                    <input type="hidden" id="feedbackScore" value="5">
                </div>
                <button type="submit" class="btn-submit" id="feedbackSubmitBtn" style="width:100%; background:linear-gradient(135deg,#3b82f6,#2563eb); color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:15px;">Mesajı Gönder</button>
            </form>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setTimeout(() => {
        if(window.setFeedbackRating) window.setFeedbackRating(5);
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
    const modal = document.getElementById('feedbackModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.setProperty('display', 'flex', 'important');
    }
    const currentUser = window.CURRENT_USER;
    if (currentUser && currentUser.email) {
        const emailInput = document.getElementById('feedbackEmail');
        if (emailInput) emailInput.value = currentUser.email;
    }
}

window.closeFeedbackModal = function() {
    const modal = document.getElementById('feedbackModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.setProperty('display', 'none', 'important');
    }
}

window.submitFeedback = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const btn = document.getElementById('feedbackSubmitBtn');
    const originalText = btn ? btn.textContent : '';
    if (btn) {
        btn.textContent = 'Gönderiliyor...';
        btn.disabled = true;
    }

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
            if (error.code === '42P01') {
                 throw new Error('Sistem kurulum aşamasındadır, mesajlar geçici olarak e-posta ile alınmaktadır. Lütfen formun üstündeki linkten e-posta atınız.');
            }
            throw error;
        }

        window.closeFeedbackModal();
        const msgEl = document.getElementById('feedbackMessage');
        if (msgEl) msgEl.value = '';
        
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
        if (btn) {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }
}

document.addEventListener('DOMContentLoaded', initFeedbackSystem);


