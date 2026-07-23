
        // ===== NAVBAR SCROLL =====
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // ===== MODAL =====
        function openModal(type) {
            document.getElementById('authModal').classList.add('active');
            switchForm(type);
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            document.getElementById('authModal').classList.remove('active');
            document.body.style.overflow = '';
        }

        function switchForm(type) {
            if (type === 'login') {
                document.getElementById('loginForm').style.display = 'block';
                document.getElementById('registerForm').style.display = 'none';
            } else {
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('registerForm').style.display = 'block';
            }
        }

        // Close modal on overlay click
        document.getElementById('authModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('authModal')) {
                closeModal();
            }
        });

        // ===== PRICING TOGGLE =====
        let isYearly = false;

        function togglePricing() {
            isYearly = !isYearly;
            const toggle = document.getElementById('pricingToggle');
            const monthlyLabel = document.getElementById('monthlyLabel');
            const yearlyLabel = document.getElementById('yearlyLabel');

            if (isYearly) {
                toggle.classList.add('yearly');
                monthlyLabel.classList.remove('active');
                yearlyLabel.classList.add('active');
            } else {
                toggle.classList.remove('yearly');
                monthlyLabel.classList.add('active');
                yearlyLabel.classList.remove('active');
            }

            document.querySelectorAll('.pricing-price').forEach(el => {
                const monthly = el.dataset.monthly;
                const yearly = el.dataset.yearly;
                el.textContent = isYearly ? yearly : monthly;
            });

            const notes = ['yearlyNote1', 'yearlyNote2', 'yearlyNote3'];
            const yearlyTotals = ['0', '2.400', '3.360'];
            notes.forEach((id, i) => {
                const noteEl = document.getElementById(id);
                if (!isYearly || yearlyTotals[i] === '0') {
                    noteEl.textContent = '\u00A0';
                } else {
                    noteEl.textContent = `Yıllık ₺${yearlyTotals[i]} olarak faturalandırılır`;
                }
            });
        }

        // ===== FAQ =====
        function toggleFaq(el) {
            const item = el.parentElement;
            const isActive = item.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

            if (!isActive) {
                item.classList.add('active');
            }
        }

        // ===== BEFORE/AFTER SLIDER =====
        const baSlider = document.getElementById('baSlider');
        const baAfter = document.getElementById('baAfter');
        const baLine = document.getElementById('baLine');
        const baHandle = document.getElementById('baHandle');
        let isDragging = false;

        function updateSlider(x) {
            const rect = baSlider.getBoundingClientRect();
            let pos = (x - rect.left) / rect.width;
            pos = Math.max(0.05, Math.min(0.95, pos));
            const percent = pos * 100;

            baAfter.style.clipPath = `inset(0 0 0 ${percent}%)`;
            baLine.style.left = percent + '%';
            baHandle.style.left = percent + '%';
        }

        baSlider.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateSlider(e.clientX);
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) updateSlider(e.clientX);
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch support
        baSlider.addEventListener('touchstart', (e) => {
            isDragging = true;
            updateSlider(e.touches[0].clientX);
        });

        window.addEventListener('touchmove', (e) => {
            if (isDragging) updateSlider(e.touches[0].clientX);
        });

        window.addEventListener('touchend', () => {
            isDragging = false;
        });

        // ===== SCROLL TO DEMO =====
        function scrollToDemo() {
            document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
        }

        // ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.feature-card, .step-card, .pricing-card, .testimonial-card, .faq-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });

        // Mobile menu
        function toggleMobileMenu() {
            // Simple mobile menu toggle - could be expanded
            const links = document.querySelector('.nav-links');
            links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
            links.style.position = 'absolute';
            links.style.top = '100%';
            links.style.left = '0';
            links.style.right = '0';
            links.style.flexDirection = 'column';
            links.style.background = 'rgba(10, 10, 26, 0.98)';
            links.style.padding = '20px';
            links.style.gap = '20px';
            links.style.borderBottom = '1px solid rgba(108, 92, 231, 0.2)';
        }

        function changeMockupStep(step, el) {
            document.querySelectorAll('.mockup-toolbar .tool-icon').forEach(icon => icon.classList.remove('active'));
            el.classList.add('active');
            
            const img = document.getElementById('mockupAfterImg');
            const fallback = document.getElementById('mockupFallback');
            const fallbackIcon = document.getElementById('mockupFallbackIcon');
            const fallbackText = document.getElementById('mockupFallbackText');
            
            img.style.display = 'none';
            fallback.style.display = 'flex';
            
            const fallbackData = {
                1: { icon: 'fa-magic', text: 'Adım 1 Görseli Yüklenmedi' },
                2: { icon: 'fa-draw-polygon', text: 'Adım 2 Görseli Yüklenmedi' },
                3: { icon: 'fa-layer-group', text: 'Adım 3 Görseli Yüklenmedi' },
                4: { icon: 'fa-file-export', text: 'Adım 4 Görseli Yüklenmedi' },
                5: { icon: 'fa-share-alt', text: 'Adım 5 Görseli Yüklenmedi' }
            };
            
            if(fallbackData[step]) {
                fallbackIcon.className = 'fas ' + fallbackData[step].icon;
                fallbackText.textContent = fallbackData[step].text;
            }
            
            img.src = `assets/demo/mockup-step${step}.jpg`;
        }
    