/* =========================================
   CYCLE V5 — SHARP EDITION ENGINE
   Ripple · Panel · Animations
   ========================================= */

(function () {
    'use strict';

    const PHASE_DATA = {
        expansion: {
            name: 'Expansion',
            icon: 'trending-up',
            strategy: 'Stratégie : croissance contrôlée',
            description: 'Les marchés progressent, l\'économie croît et la confiance est élevée. Nous maximisons l\'exposition aux actions tout en surveillant les signaux d\'inflation pour anticiper les retournements.',
            allocation: { actions: 65, obligations: 20, alternatif: 15 },
            volatility: 'modérée',
            horizon: 'moyen terme',
            colorClass: 'expansion',
            centerMini: 'Croissance & opportunités'
        },
        surchauffe: {
            name: 'Surchauffe',
            icon: 'flame',
            strategy: 'Stratégie : protection progressive',
            description: 'Les marchés montrent des signes de tension. Nous réduisons graduellement l\'exposition aux actifs volatils et prenons des profits de façon stratégique pour protéger les gains acquis.',
            allocation: { actions: 40, obligations: 35, alternatif: 25 },
            volatility: 'élevée',
            horizon: 'court terme',
            colorClass: 'surchauffe',
            centerMini: 'Vigilance & prudence'
        },
        recession: {
            name: 'Récession',
            icon: 'shield',
            strategy: 'Stratégie : préservation du capital',
            description: 'L\'économie se contracte et la volatilité est forte. Nous pivotons vers les obligations de qualité et les secteurs défensifs pour préserver votre patrimoine en période de turbulence.',
            allocation: { actions: 25, obligations: 50, alternatif: 25 },
            volatility: 'très élevée',
            horizon: 'long terme',
            colorClass: 'recession',
            centerMini: 'Protection & résilience'
        },
        reprise: {
            name: 'Reprise',
            icon: 'sunrise',
            strategy: 'Stratégie : repositionnement stratégique',
            description: 'Les signaux de relance émergent. Nous repositionnons le portefeuille vers les secteurs à fort potentiel de rebond — technologie, industrie — pour capter la reprise avant la majorité du marché.',
            allocation: { actions: 55, obligations: 25, alternatif: 20 },
            volatility: 'décroissante',
            horizon: 'moyen-long terme',
            colorClass: 'reprise',
            centerMini: 'Opportunités & relance'
        }
    };

    function init() {
        const quadrants = document.querySelectorAll('.radar-quadrant');
        const panel = document.getElementById('cycle-detail-panel');
        const rippleEl = document.getElementById('cycle-ripple');

        if (!quadrants.length || !panel) return;

        quadrants.forEach(q => {
            q.addEventListener('click', () => {
                const phase = q.getAttribute('data-phase');
                if (!phase || !PHASE_DATA[phase]) return;

                // Update active quadrant
                quadrants.forEach(el => el.classList.remove('active'));
                q.classList.add('active');

                // === RIPPLE EFFECT ===
                triggerRipple(phase, rippleEl);

                // === PANEL SWITCH with slide-in ===
                panel.classList.add('switching');

                setTimeout(() => {
                    updatePanel(phase);
                    panel.classList.remove('switching');

                    // Pulse CTA
                    const cta = document.getElementById('cycle-to-compas-btn');
                    if (cta) {
                        cta.classList.remove('pulse-hint');
                        void cta.offsetWidth;
                        cta.classList.add('pulse-hint');
                    }
                }, 250);

                // Update center text
                const titleEl = document.getElementById('cycle-title');
                const descMini = document.getElementById('cycle-desc-mini');
                if (titleEl) {
                    titleEl.textContent = PHASE_DATA[phase].name;
                    titleEl.className = 'text-gradient-' + phase;
                }
                if (descMini) {
                    descMini.textContent = PHASE_DATA[phase].centerMini;
                }

                // Keep old cycle-desc for compas.js compatibility
                const cycleDesc = document.getElementById('cycle-desc');
                if (cycleDesc) {
                    cycleDesc.textContent = PHASE_DATA[phase].description;
                }
            });
        });

        // Disclaimer CTA smooth scroll
        const disclaimerCta = document.getElementById('disclaimer-cta');
        if (disclaimerCta) {
            disclaimerCta.addEventListener('click', function (e) {
                e.preventDefault();
                const compas = document.getElementById('compas');
                if (compas) compas.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    }

    // === RIPPLE EFFECT ===
    function triggerRipple(phase, rippleEl) {
        if (!rippleEl) return;

        // Remove previous
        rippleEl.className = 'cycle-ripple';
        void rippleEl.offsetWidth; // force reflow

        // Add phase color + activate
        rippleEl.classList.add('ripple-' + phase, 'ripple-active');

        // Clean up after animation
        setTimeout(() => {
            rippleEl.className = 'cycle-ripple';
        }, 950);
    }

    // === UPDATE PANEL ===
    function updatePanel(phase) {
        const data = PHASE_DATA[phase];

        // Phase header
        const iconWrap = document.getElementById('phase-icon-wrap');
        if (iconWrap) {
            iconWrap.className = 'phase-icon-wrap phase-' + data.colorClass;
            iconWrap.innerHTML = '<i data-lucide="' + data.icon + '"></i>';
        }

        const nameEl = document.getElementById('phase-name');
        if (nameEl) {
            nameEl.textContent = data.name;
            nameEl.className = 'phase-name color-' + data.colorClass;
        }

        const stratEl = document.getElementById('phase-strategy');
        if (stratEl) stratEl.textContent = data.strategy;

        // Description
        const descEl = document.getElementById('phase-description');
        if (descEl) descEl.textContent = data.description;

        // Allocation bars
        const allocSection = document.querySelector('.alloc-section');
        if (allocSection) {
            allocSection.className = 'alloc-section alloc-' + data.colorClass;
        }

        animateBar('alloc-bar-actions', 'alloc-pct-actions', data.allocation.actions);
        animateBar('alloc-bar-obligations', 'alloc-pct-obligations', data.allocation.obligations);
        animateBar('alloc-bar-alternatif', 'alloc-pct-alternatif', data.allocation.alternatif);

        // Indicators
        const volEl = document.getElementById('indicator-volatility');
        if (volEl) {
            volEl.className = 'indicator-chip chip-' + data.colorClass;
            volEl.innerHTML = '<i data-lucide="activity" style="width:14px;height:14px;"></i><span>Volatilité : <strong>' + data.volatility + '</strong></span>';
        }

        const horEl = document.getElementById('indicator-horizon');
        if (horEl) {
            horEl.className = 'indicator-chip chip-' + data.colorClass;
            horEl.innerHTML = '<i data-lucide="clock" style="width:14px;height:14px;"></i><span>Horizon : <strong>' + data.horizon + '</strong></span>';
        }

        // Re-render lucide icons
        if (window.lucide) lucide.createIcons();
    }

    // === ANIMATED BARS ===
    function animateBar(barId, pctId, value) {
        const bar = document.getElementById(barId);
        const pct = document.getElementById(pctId);

        if (bar) {
            bar.style.width = '0%';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    bar.style.width = value + '%';
                });
            });
        }

        if (pct) {
            const start = parseInt(pct.textContent) || 0;
            const duration = 600;
            const startTime = performance.now();

            function tick(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(start + (value - start) * eased);
                pct.textContent = current + '%';
                if (progress < 1) requestAnimationFrame(tick);
            }

            requestAnimationFrame(tick);
        }
    }

    // === SMOOTH SCROLL CTAs ===
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.cycle-to-compas-btn');
        if (btn) {
            e.preventDefault();
            const compas = document.getElementById('compas');
            if (compas) compas.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    document.addEventListener('DOMContentLoaded', init);
})();
