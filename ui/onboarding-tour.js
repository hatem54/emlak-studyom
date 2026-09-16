/**
 * ============================================
 * ONBOARDING TOUR / ÜRÜN TURU
 * ui/onboarding-tour.js
 * ============================================
 * 
 * Amaç: Kullanıcı uygulamaya ilk girdiğinde hafif ve hızlı bir rehber sunmak.
 * Özellikler: Modüler, güvenli (try/catch), kural tabanlı, performansı etkilemez.
 */

window.onboardingTourState = {
    isOpen: false,
    currentStep: 0,
    hasSeenTour: false,
    dismissed: false,
    steps: [
        {
            tab: "data",
            title: "1. 📝 Giriş & 🤖 Metni Süz",
            text: "Sahibinden veya WhatsApp ilan metninizi yapıştırıp <b>'🤖 Metni Süz'</b> butonuna basarak fiyat, m², ada/parsel vb. tüm bilgileri ve ilana özel akıllı rozetleri saniyeler içinde otomatik çıkartın.",
            targetSelector: "button[data-tab='data']"
        },
        {
            tab: "photo",
            title: "2. 📸 Fotoğraf & Kadraj",
            text: "Arka plan fotoğrafınızı yükleyin; 16:9, 1:1, 4:5 veya 9:16 formatlarını seçip zoom, pan ve canlı renk filtreleriyle görselinizi profesyonelleştirin.",
            targetSelector: "button[data-tab='photo']"
        },
        {
            tab: "draw",
            title: "3. 🖌️ Akıllı Çizim & Parsel",
            text: "Arsa ve bahçe sınırlarını çizimle belirleyin; çizgileri birleştirip otomatik kapalı parsel alanına dönüştürün ve ölçü etiketleri ekleyin.",
            targetSelector: "button[data-tab='draw']"
        },
        {
            tab: "canva",
            title: "4. 🎨 Profesyonel Şablonlar",
            text: "Instagram postu, hikaye veya vitrin baskısı için tasarlanmış Elit, Minimal, Lüks, Kolaj ve Portföy şablonlarını tek tıkla uygulayın.",
            targetSelector: "button[data-tab='canva']"
        },
        {
            tab: "callout",
            title: "5. 🏷️ Akıllı Rozetler & İkonlar",
            text: "İlanınızdan otomatik oluşturulan 'Müstakil Tapulu', 'Krediye Uygun', fiyat ve konum gibi hazır rozetleri ve emlak ikonlarını tuvale sürükleyin.",
            targetSelector: "button[data-tab='callout']"
        },
        {
            tab: "element",
            title: "6. 🎛️ Element & Katmanlar",
            text: "Tuvaldeki tüm nesnelerin font, renk, kutu stili, parlaklık ve katman dizilimini kolayca özelleştirin.",
            targetSelector: "button[data-tab='element']"
        },
        {
            tab: "batch",
            title: "7. 📥 Çıktı Alma (HD / 4K)",
            text: "Tasarımınızı yüksek çözünürlükte (HD / 4K / Baskı) JPEG veya PNG olarak tek tıkla indirin veya sosyal medyada paylaşın.",
            targetSelector: "button[data-tab='batch']"
        }
    ]
};

const OnboardingTour = {
    overlayEl: null,
    cardEl: null,
    highlightEl: null,
    resizeHandler: null,

        init: function() {
        try {
            const hasSeen = localStorage.getItem('emlakstudiom_onboarding_seen');
            if (hasSeen === 'true') {
                window.onboardingTourState.hasSeenTour = true;
                return;
            }
            setTimeout(() => {
                this.startTour();
            }, 1000);
        } catch(e) {
            console.error("Onboarding init error:", e);
        }
    },

    startTour: function() {
        try {
            if (window.onboardingTourState.isOpen) return;
            if (!document.body) return;

            window.onboardingTourState.isOpen = true;
            window.onboardingTourState.currentStep = 0;

            this.createElements();
            this.showStep();

            this.resizeHandler = () => this.updatePositions();
            window.addEventListener('resize', this.resizeHandler);
            window.addEventListener('scroll', this.resizeHandler, true);

        } catch(e) {
            console.error("Onboarding start error:", e);
        }
    },

    restartTour: function() {
        this.endTour();
        setTimeout(() => {
            this.startTour();
        }, 100);
    },

    createElements: function() {
        if (!this.overlayEl) {
            this.overlayEl = document.createElement('div');
            this.overlayEl.className = 'onboarding-overlay';
            document.body.appendChild(this.overlayEl);
        }
        if (!this.highlightEl) {
            this.highlightEl = document.createElement('div');
            this.highlightEl.className = 'onboarding-highlight';
            document.body.appendChild(this.highlightEl);
        }
        if (!this.cardEl) {
            this.cardEl = document.createElement('div');
            this.cardEl.className = 'onboarding-card';
            document.body.appendChild(this.cardEl);
        }
        this.overlayEl.style.display = 'block';
        this.highlightEl.style.display = 'block';
        this.cardEl.style.display = 'block';
    },

    showStep: function() {
        try {
            const state = window.onboardingTourState;
            const step = state.steps[state.currentStep];
            
            if (!step) {
                this.endTour();
                return;
            }

            if (step.tab && typeof window.switchTab === 'function') {
                try { window.switchTab(step.tab); } catch(err){}
            }

            let targetEl = document.querySelector(step.targetSelector);
            
            if (!targetEl || targetEl.offsetParent === null) {
                console.warn("Onboarding target not found or hidden:", step.targetSelector);
                state.currentStep++;
                if (state.currentStep >= state.steps.length) {
                    this.endTour();
                } else {
                    this.showStep();
                }
                return;
            }

            let html = `
                <div class="onboarding-card-header">
                    <h3 class="onboarding-card-title">${step.title}</h3>
                    <span class="onboarding-card-counter">${state.currentStep + 1} / ${state.steps.length}</span>
                </div>
                <div class="onboarding-card-body">
                    <p>${step.text}</p>
                </div>
                <div class="onboarding-card-footer">
            `;

            if (state.currentStep > 0) {
                html += `<button class="onboarding-btn btn-secondary" onclick="OnboardingTour.prevStep()">Geri</button>`;
            } else {
                html += `<button class="onboarding-btn btn-text" onclick="OnboardingTour.endTour()">Geç</button>`;
            }

            if (state.currentStep < state.steps.length - 1) {
                html += `<button class="onboarding-btn btn-primary" onclick="OnboardingTour.nextStep()">İleri</button>`;
            } else {
                html += `<button class="onboarding-btn btn-primary" onclick="OnboardingTour.endTour()">Turu Bitir</button>`;
            }

            html += `</div>`;
            this.cardEl.innerHTML = html;

            this.updatePositions();
            
        } catch(e) {
            console.error("Onboarding showStep error:", e);
            this.endTour();
        }
    },

    updatePositions: function() {
        if (!window.onboardingTourState.isOpen) return;
        const step = window.onboardingTourState.steps[window.onboardingTourState.currentStep];
        if (!step) return;
        
        const targetEl = document.querySelector(step.targetSelector);
        if (!targetEl) return;

        const rect = targetEl.getBoundingClientRect();
        const padding = 8;
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            this.highlightEl.style.display = 'none';
            this.overlayEl.style.clipPath = 'none';
            this.cardEl.style.top = 'auto';
            this.cardEl.style.bottom = '20px';
            this.cardEl.style.left = '50%';
            this.cardEl.style.transform = 'translateX(-50%)';
            this.cardEl.style.width = '90%';
        } else {
            this.highlightEl.style.display = 'block';
            
            const hTop = rect.top - padding;
            const hLeft = rect.left - padding;
            const hWidth = rect.width + (padding * 2);
            const hHeight = rect.height + (padding * 2);

            this.highlightEl.style.top = hTop + 'px';
            this.highlightEl.style.left = hLeft + 'px';
            this.highlightEl.style.width = hWidth + 'px';
            this.highlightEl.style.height = hHeight + 'px';

            this.overlayEl.style.clipPath = `polygon(
                0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
                ${hLeft}px 0%, 
                ${hLeft}px ${hTop}px, 
                ${hLeft + hWidth}px ${hTop}px, 
                ${hLeft + hWidth}px ${hTop + hHeight}px, 
                ${hLeft}px ${hTop + hHeight}px, 
                ${hLeft}px 0%
            )`;

            this.cardEl.style.width = '300px';
            this.cardEl.style.transform = 'none';
            
            let cardTop = hTop + hHeight + 15;
            let cardLeft = hLeft;

            if (cardLeft + 300 > window.innerWidth) {
                cardLeft = window.innerWidth - 320;
            }
            if (cardTop + 150 > window.innerHeight) {
                cardTop = hTop - 165; 
            }
            if (cardTop < 10) cardTop = 10;
            if (hLeft > window.innerWidth - 350) {
                 cardLeft = hLeft - 320;
                 cardTop = hTop;
            }

            this.cardEl.style.top = cardTop + 'px';
            this.cardEl.style.left = cardLeft + 'px';
            this.cardEl.style.bottom = 'auto';
        }
    },

    nextStep: function() {
        window.onboardingTourState.currentStep++;
        this.showStep();
    },

    prevStep: function() {
        if (window.onboardingTourState.currentStep > 0) {
            window.onboardingTourState.currentStep--;
            this.showStep();
        }
    },

    endTour: function() {
        try {
            window.onboardingTourState.isOpen = false;
            window.onboardingTourState.hasSeenTour = true;
            localStorage.setItem('emlakstudiom_onboarding_seen', 'true');

            if (this.overlayEl && this.overlayEl.parentNode) this.overlayEl.parentNode.removeChild(this.overlayEl);
            if (this.highlightEl && this.highlightEl.parentNode) this.highlightEl.parentNode.removeChild(this.highlightEl);
            if (this.cardEl && this.cardEl.parentNode) this.cardEl.parentNode.removeChild(this.cardEl);
            
            this.overlayEl = null;
            this.highlightEl = null;
            this.cardEl = null;

            document.body.classList.remove('onboarding-active-body');

            if (this.resizeHandler) {
                window.removeEventListener('resize', this.resizeHandler);
                this.resizeHandler = null;
            }
        } catch(e) {
            console.error("Onboarding end error:", e);
        }
    },
    
    restartTour: function() {
        this.startTour();
    }
};

window.OnboardingTour = OnboardingTour;

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
        OnboardingTour.init();
    });
} else {
    OnboardingTour.init();
}