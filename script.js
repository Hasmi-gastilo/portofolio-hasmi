document.addEventListener('DOMContentLoaded', function () {
    // --- INISIALISASI FIREBASE ---
    let db;
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("Firebase berhasil diinisialisasi");
    } catch (error) {
        console.error("Error inisialisasi Firebase:", error);
    }

    // --- FUNGSI COUNT-UP ANGKA DAN BAR ---
    function animateCountUp(element, target) {
        let start = 0;
        const duration = 1500;
        const step = target / (duration / 10);

        const timer = setInterval(() => {
            start += step;

            if (start >= target) {
                start = target;
                clearInterval(timer);
            }

            const currentCount = Math.floor(start);
            element.style.width = currentCount + '%';
            element.textContent = currentCount + '%';
        }, 10);
    }

    function startSkillAnimation(containerElement) {
        const activeTabContent = containerElement.querySelector('.tab-content.active');
        if (activeTabContent) {
            activeTabContent.querySelectorAll('.progress').forEach(bar => {
                bar.textContent = '0%';
                bar.style.width = '0%';
            });

            const progressBars = activeTabContent.querySelectorAll('.progress');
            progressBars.forEach(bar => {
                const target = parseInt(bar.getAttribute('data-target'));
                if (!isNaN(target)) {
                    animateCountUp(bar, target);
                }
            });
        }
    }

    // --- FUNGSI KIRIM FORM KE FIREBASE ---
    const form = document.getElementById('contact-form');
    const statusDisplay = document.getElementById('form-status');

    if (form && db) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            // Ambil data dari form
            const formData = {
                name: this.name.value.trim(),
                email: this.email.value.trim(),
                message: this.message.value.trim(),
                timestamp: new Date(),
                read: false
            };

            // Validasi sederhana
            if (!formData.name || !formData.email || !formData.message) {
                statusDisplay.textContent = '❌ Harap isi semua field!';
                statusDisplay.style.color = '#FF4500';
                return;
            }

            // Validasi email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                statusDisplay.textContent = '❌ Format email tidak valid!';
                statusDisplay.style.color = '#FF4500';
                return;
            }

            // Tampilkan status loading
            statusDisplay.textContent = '🔄 Mengirim pesan...';
            statusDisplay.style.color = '#00BFFF';

            // Nonaktifkan tombol submit
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Mengirim...';

            try {
                // Simpan ke Firebase Firestore
                await db.collection("contacts").add(formData);

                // Sukses
                statusDisplay.textContent = '✅ Pesan berhasil terkirim! Saya akan membalas segera.';
                statusDisplay.style.color = '#39FF14';
                form.reset();

            } catch (error) {
                console.error('Error menyimpan ke Firebase:', error);
                statusDisplay.textContent = '❌ Gagal mengirim pesan. Silakan coba lagi.';
                statusDisplay.style.color = '#FF4500';
            } finally {
                // Aktifkan kembali tombol submit
                submitButton.disabled = false;
                submitButton.textContent = 'Kirim Pesan';
            }
        });
    } else if (!db) {
        console.error('Firebase tidak terinisialisasi dengan benar');
    }
    // --- PORTFOLIO SLIDER FUNCTIONALITY ---
    const portfolioSlider = document.querySelector('.portfolio-slider');
    if (portfolioSlider) {
        const track = portfolioSlider.querySelector('.slider-track');
        const slides = portfolioSlider.querySelectorAll('.slide');
        const prevBtn = portfolioSlider.querySelector('.prev-btn');
        const nextBtn = portfolioSlider.querySelector('.next-btn');
        const dots = portfolioSlider.querySelectorAll('.dot');

        let currentSlide = 0;
        const totalSlides = slides.length;

        // Update slider position
        function updateSlider() {
            track.style.transform = `translateX(-${currentSlide * 100}%)`;

            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        // Next slide
        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateSlider();
        }

        // Previous slide
        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateSlider();
        }

        // Event listeners
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                updateSlider();
            });
        });

        // Auto slide (optional)
        let slideInterval = setInterval(nextSlide, 5000);

        // Pause auto slide on hover
        portfolioSlider.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });

        portfolioSlider.addEventListener('mouseleave', () => {
            slideInterval = setInterval(nextSlide, 5000);
        });

        // Touch swipe support
        let startX = 0;
        let endX = 0;

        portfolioSlider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        portfolioSlider.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = startX - endX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }
    }

    // Lightbox Functionality
    function initLightbox() {
        const lightboxModal = document.getElementById('lightbox-modal');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxTitle = document.getElementById('lightbox-title');
        const lightboxDesc = document.getElementById('lightbox-desc');
        const lightboxClose = document.querySelector('.lightbox-close');
        const galleryItems = document.querySelectorAll('.gallery-item');

        // Open lightbox when gallery item is clicked
        galleryItems.forEach(item => {
            item.addEventListener('click', function () {
                const imgSrc = this.querySelector('img').src;
                const title = this.getAttribute('data-title');
                const desc = this.getAttribute('data-desc');

                lightboxImg.src = imgSrc;
                lightboxTitle.textContent = title;
                lightboxDesc.textContent = desc;
                lightboxModal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });

        // Close lightbox
        lightboxClose.addEventListener('click', function () {
            lightboxModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        // Close when clicking outside the image
        lightboxModal.addEventListener('click', function (e) {
            if (e.target === lightboxModal) {
                lightboxModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        // Close with ESC key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && lightboxModal.style.display === 'block') {
                lightboxModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Panggil fungsi lightbox setelah DOM loaded
    document.addEventListener('DOMContentLoaded', function () {
        initLightbox();
    });

    // --- FUNGSI LAINNYA (TYPING, MENU, SCROLL, TABS) ---

    // 1. Typing Effect
    const typingTextElement = document.querySelector('.typing-text');
    if (typingTextElement) {
        const texts = JSON.parse(typingTextElement.getAttribute('data-texts'));
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentText = texts[textIndex];
            const typeSpeed = isDeleting ? 70 : 150;

            if (!isDeleting) {
                typingTextElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;

                if (charIndex === currentText.length) {
                    isDeleting = true;
                    setTimeout(type, 1500);
                    return;
                }
            } else {
                typingTextElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;

                if (charIndex === 0) {
                    isDeleting = false;
                    textIndex = (textIndex + 1) % texts.length;
                }
            }
            setTimeout(type, typeSpeed);
        }
        type();
    }

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.navbar-menu');
    const langSelector = document.querySelector('.navbar-lang');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            if (langSelector) langSelector.classList.toggle('active');
        });
    }

    if (navMenu) {
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                    if (langSelector) langSelector.classList.remove('active');
                }
            });
        });
    }

    // 3. Reveal on Scroll
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                if (entry.target.id === 'skills') {
                    if (!entry.target.classList.contains('animated')) {
                        const skillsSection = document.getElementById('skills');
                        startSkillAnimation(skillsSection);
                        entry.target.classList.add('animated');
                    }
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(element => {
        observer.observe(element);
    });

    // 4. Skills Tabs
    const skillTabs = document.querySelectorAll('.skills-tabs .tab-btn');
    const skillContents = document.querySelectorAll('.skills-content .tab-content');
    const skillsSection = document.getElementById('skills');

    skillTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            skillTabs.forEach(t => t.classList.remove('active'));
            skillContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            const targetElement = document.getElementById(targetId);
            if (targetElement) targetElement.classList.add('active');

            if (skillsSection && skillsSection.classList.contains('visible')) {
                startSkillAnimation(skillsSection);
            }
        });
    });

    // Smooth scrolling untuk anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            // Tambahkan kode JavaScript ini di bagian akhir file JavaScript Anda, sebelum penutup

            // Portfolio Slider Functionality
            const portfolioSlider = document.querySelector('.portfolio-slider');
            if (portfolioSlider) {
                const track = portfolioSlider.querySelector('.slider-track');
                const slides = portfolioSlider.querySelectorAll('.slide');
                const prevBtn = portfolioSlider.querySelector('.prev-btn');
                const nextBtn = portfolioSlider.querySelector('.next-btn');
                const dots = portfolioSlider.querySelectorAll('.dot');

                let currentSlide = 0;
                const totalSlides = slides.length;

                // Update slider position
                function updateSlider() {
                    track.style.transform = `translateX(-${currentSlide * 100}%)`;

                    // Update dots
                    dots.forEach((dot, index) => {
                        dot.classList.toggle('active', index === currentSlide);
                    });
                }

                // Next slide
                function nextSlide() {
                    currentSlide = (currentSlide + 1) % totalSlides;
                    updateSlider();
                }

                // Previous slide
                function prevSlide() {
                    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                    updateSlider();
                }

                // Event listeners
                if (nextBtn) nextBtn.addEventListener('click', nextSlide);
                if (prevBtn) prevBtn.addEventListener('click', prevSlide);

                // Dot navigation
                dots.forEach((dot, index) => {
                    dot.addEventListener('click', () => {
                        currentSlide = index;
                        updateSlider();
                    });
                });

                // Auto slide (setiap 6 detik)
                let slideInterval = setInterval(nextSlide, 6000);

                // Pause auto slide on hover
                portfolioSlider.addEventListener('mouseenter', () => {
                    clearInterval(slideInterval);
                });

                portfolioSlider.addEventListener('mouseleave', () => {
                    slideInterval = setInterval(nextSlide, 6000);
                });

                // Touch swipe support
                let startX = 0;
                let endX = 0;

                portfolioSlider.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                });

                portfolioSlider.addEventListener('touchend', (e) => {
                    endX = e.changedTouches[0].clientX;
                    handleSwipe();
                });

                function handleSwipe() {
                    const swipeThreshold = 50;
                    const diff = startX - endX;

                    if (Math.abs(diff) > swipeThreshold) {
                        if (diff > 0) {
                            nextSlide();
                        } else {
                            prevSlide();
                        }
                    }
                }

                // Initialize slider
                updateSlider();
            }

        });
    });
});

