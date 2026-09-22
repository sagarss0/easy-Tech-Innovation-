document.addEventListener('DOMContentLoaded', function () {

    // ==========================================
    // 1. DARK MODE TOGGLE & PERSISTENCE
    // ==========================================
    const themeToggleBtn = document.getElementById('themeToggleBtn') || document.getElementById('theme-toggle');

    // Load saved theme state
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }


    // ==========================================
    // 2. STICKY HEADER SCROLL SHADOW EFFECT
    // ==========================================
    const header = document.querySelector('.site-header');

    if (header) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 30) {
                header.style.boxShadow = '0 10px 30px -10px var(--shadow-color)';
            } else {
                header.style.boxShadow = '0 4px 20px -5px var(--shadow-color)';
            }
        });
    }


    // ==========================================
    // 3. SMOOTH SCROLLING FOR NAVIGATION LINKS
    // ==========================================
    const navLinks = document.querySelectorAll('.centered-nav a, .nav-links a, a[href^="#"]');

    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    e.preventDefault();
                    const headerOffset = 90; // Header offset adjustment
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });


    // ==========================================
    // 4. MODAL (LAB REPORT POPUP) CONTROLS
    // ==========================================
    const reportModal = document.getElementById('reportModal') || document.getElementById('labReportModal');
    const openModalBtns = document.querySelectorAll('#openModalBtn, .btn-open-modal');
    const closeModalBtns = document.querySelectorAll('#closeModalBtn, #closeModalFooterBtn, .close-btn, .btn-modal-close');

    function openModal() {
        if (reportModal) {
            reportModal.classList.remove('hidden');
            const modalContent = reportModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.animation = 'modalScaleUp 0.3s ease-out forwards';
            }
            document.body.style.overflow = 'hidden'; // Prevents background scroll
        }
    }

    function closeModal() {
        if (reportModal) {
            reportModal.classList.add('hidden');
            document.body.style.overflow = 'auto'; // Re-enables background scroll
        }
    }

    // Attach click listeners to all open modal triggers
    openModalBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    });

    // Attach click listeners to all close modal triggers
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Dark backdrop click to close modal
    window.addEventListener('click', function (e) {
        if (e.target === reportModal) {
            closeModal();
        }
    });

    // ESC Key press to close modal
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && reportModal && !reportModal.classList.contains('hidden')) {
            closeModal();
        }
    });


    // ==========================================
    // 5. DYNAMIC LEAD FORM SUBMIT & WHATSAPP REDIRECT
    // ==========================================
    const leadForm = document.getElementById('leadForm');
    const formSuccess = document.getElementById('formSuccess') || document.getElementById('formSuccessAlert');

    if (leadForm) {
        const submitBtn = leadForm.querySelector('button[type="submit"]');

        leadForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Values Fetching with fallback empty string
            const hospitalName = document.getElementById('hospitalName') ? document.getElementById('hospitalName').value.trim() : '';
            const contactPerson = document.getElementById('contactPerson') ? document.getElementById('contactPerson').value.trim() : '';
            const city = document.getElementById('city') ? document.getElementById('city').value.trim() : '';
            const bedCount = document.getElementById('bedCount') ? document.getElementById('bedCount').value.trim() : '';

            // Button Loading State
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '⏳ Submitting...';
            submitBtn.style.opacity = '0.8';
            submitBtn.disabled = true;

            setTimeout(function () {
                // Restore Button & Show Success Alert
                submitBtn.innerHTML = '✓ Submitted!';
                submitBtn.style.background = '#16a34a';

                if (formSuccess) {
                    formSuccess.classList.remove('hidden');
                }

                // Prepare WhatsApp Message Format
                const message = `*New Bulk Lead Inquiry*%0A%0A` +
                    `🏥 *Hospital Name:* ${encodeURIComponent(hospitalName)}%0A` +
                    `👤 *Contact Person:* ${encodeURIComponent(contactPerson)}%0A` +
                    `📍 *Location:* ${encodeURIComponent(city)}%0A` +
                    `🛏️ *Approx. Beds:* ${encodeURIComponent(bedCount)}`;

                // Redirect to WhatsApp
                setTimeout(function () {
                    window.open(`https://wa.me/9873205829?text=${message}`, '_blank');

                    // Reset Form & Button State
                    leadForm.reset();
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.style.background = '';
                    submitBtn.style.opacity = '1';
                    submitBtn.disabled = false;
                }, 1200);

            }, 800);
        });
    }


    // ==========================================
    // 6. GEOLOCATION (AUTO-DETECT LOCATION)
    // ==========================================
    const detectBtn = document.getElementById('detectLocationBtn');
    const cityInput = document.getElementById('city');

    if (detectBtn && cityInput) {
        detectBtn.addEventListener('click', function () {
            if ("geolocation" in navigator) {
                detectBtn.innerText = '⏳';

                navigator.geolocation.getCurrentPosition(
                    async function (position) {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;

                        try {
                            // Reverse Geocoding with OpenStreetMap API
                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
                            const data = await response.json();

                            const detectedCity = data.address.city || data.address.town || data.address.state_district || data.address.state || "Location Detected";

                            cityInput.value = detectedCity;
                            detectBtn.innerText = '✅';
                        } catch (error) {
                            cityInput.value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                            detectBtn.innerText = '📍';
                        }
                    },
                    function (error) {
                        alert("Location access denied or unavailable. Please enter manually.");
                        detectBtn.innerText = '📍';
                    }
                );
            } else {
                alert("Geolocation is not supported by your browser.");
            }
        });
    }


    // ==========================================
    // 7. INPUT FOCUS INTERACTIVE EFFECTS
    // ==========================================
    const inputs = document.querySelectorAll('.lead-form input');

    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            if (this.parentElement) {
                this.parentElement.style.transform = 'translateY(-1px)';
            }
        });

        input.addEventListener('blur', function () {
            if (this.parentElement) {
                this.parentElement.style.transform = 'translateY(0)';
            }
        });
    });


  // ==========================================
    // 8. HIDE FLOATING WHATSAPP ONLY AT CONTACT/FOOTER SECTION
    // ==========================================
    const waFloatBtn = document.querySelector('.float-wa');
    const contactSection = document.querySelector('.site-footer') || document.getElementById('contact');

    if (waFloatBtn && contactSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    waFloatBtn.classList.add('hide-float');
                } else {
                    waFloatBtn.classList.remove('hide-float');
                }
            });
        }, {
            threshold: 0.1
        });

        observer.observe(contactSection);
    }