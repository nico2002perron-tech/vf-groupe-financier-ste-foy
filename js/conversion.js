/* =========================================
   CONVERSION KIT — JS
   Floating CTA + Form behavior
   ========================================= */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        // ── 1. FLOATING CTA BUBBLE ──
        const ctaBtn = document.getElementById('floating-cta-btn');
        const ctaPanel = document.getElementById('floating-cta-panel');
        const ctaClose = document.getElementById('floating-panel-close');
        const floatingFormLink = document.getElementById('floating-form-link');
        const floatingCta = document.getElementById('floating-cta');

        let panelOpen = false;

        function togglePanel() {
            panelOpen = !panelOpen;
            if (ctaPanel) {
                ctaPanel.classList.toggle('active', panelOpen);
            }
        }

        function closePanel() {
            panelOpen = false;
            if (ctaPanel) ctaPanel.classList.remove('active');
        }

        if (ctaBtn) ctaBtn.addEventListener('click', togglePanel);
        if (ctaClose) ctaClose.addEventListener('click', closePanel);

        // Close on clicking "Prendre rendez-vous" in panel (scroll to form)
        if (floatingFormLink) {
            floatingFormLink.addEventListener('click', function (e) {
                e.preventDefault();
                closePanel();
                const formSection = document.getElementById('contact-form-section');
                if (formSection) {
                    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }

        // Close panel when clicking outside
        document.addEventListener('click', function (e) {
            if (panelOpen && floatingCta && !floatingCta.contains(e.target)) {
                closePanel();
            }
        });

        // Hide floating CTA when contact form is visible
        if (floatingCta) {
            const contactSection = document.getElementById('contact-form-section');
            if (contactSection) {
                const observer = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            floatingCta.style.opacity = '0';
                            floatingCta.style.pointerEvents = 'none';
                        } else {
                            floatingCta.style.opacity = '1';
                            floatingCta.style.pointerEvents = 'all';
                        }
                    });
                }, { threshold: 0.3 });
                observer.observe(contactSection);
            }

            // Also hide when footer is visible
            const footer = document.querySelector('footer');
            if (footer) {
                const footerObserver = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            floatingCta.style.opacity = '0';
                            floatingCta.style.pointerEvents = 'none';
                        } else {
                            floatingCta.style.opacity = '1';
                            floatingCta.style.pointerEvents = 'all';
                        }
                    });
                }, { threshold: 0.2 });
                footerObserver.observe(footer);
            }
        }

        // ── 2. POST-COMPAS CTA — Smooth scroll ──
        document.querySelectorAll('.cta-form-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const formSection = document.getElementById('contact-form-section');
                if (formSection) {
                    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // ── 3. FORM — Submit feedback ──
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', function (e) {
                // FormSubmit handles the actual submission via action URL.
                // We just show visual feedback briefly before the redirect/reload.
                const btn = document.getElementById('form-submit-btn');
                if (btn) {
                    btn.innerHTML = '<i data-lucide="check-circle" style="width:18px;height:18px;"></i> Envoyé avec succès!';
                    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    if (window.lucide) lucide.createIcons();
                }
            });
        }

        // ── LUCIDE REFRESH ──
        if (window.lucide) lucide.createIcons();
    });
})();
