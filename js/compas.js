/* =========================================
   COMPAS PATRIMONIAL I.A. — ENGINE V2
   Calculator · AI Text · SVG Chart
   Questionnaire · Tooltips · Cycle-Linked
   ========================================= */

(function () {
    'use strict';

    // ── Cycle Phase Data ──
    const CYCLE_DATA = {
        expansion: {
            name: 'Expansion',
            color: '#10b981',
            emoji: '📈',
            returnModifier: 1.15,
            volatility: 'modérée',
            allocation: { actions: 65, obligations: 20, alternatif: 15 },
            strategy: 'croissance contrôlée',
            description: 'Phase de croissance économique soutenue'
        },
        surchauffe: {
            name: 'Surchauffe',
            color: '#f59e0b',
            emoji: '🔥',
            returnModifier: 0.9,
            volatility: 'élevée',
            allocation: { actions: 40, obligations: 35, alternatif: 25 },
            strategy: 'protection progressive',
            description: 'Phase de vigilance accrue sur les marchés'
        },
        recession: {
            name: 'Récession',
            color: '#ef4444',
            emoji: '🛡️',
            returnModifier: 0.7,
            volatility: 'très élevée',
            allocation: { actions: 25, obligations: 50, alternatif: 25 },
            strategy: 'préservation du capital',
            description: 'Phase défensive pour protéger vos actifs'
        },
        reprise: {
            name: 'Reprise',
            color: '#3b82f6',
            emoji: '🌅',
            returnModifier: 1.25,
            volatility: 'décroissante',
            allocation: { actions: 55, obligations: 25, alternatif: 20 },
            strategy: 'repositionnement stratégique',
            description: "Phase d'opportunités pour capter la relance"
        }
    };

    // ── Risk Profile Data ──
    const PROFILES = {
        prudent: {
            name: 'Prudent',
            baseReturn: 0.045,
            emoji: '🛡️',
            adjective: 'conservatrice',
            description: 'Vous privilégiez la sécurité et la stabilité. Votre portefeuille sera axé sur les obligations et les placements à faible volatilité.'
        },
        equilibre: {
            name: 'Équilibré',
            baseReturn: 0.065,
            emoji: '⚖️',
            adjective: 'équilibrée',
            description: 'Vous recherchez un juste milieu entre croissance et sécurité. Un mix diversifié d\'actions et d\'obligations est idéal pour vous.'
        },
        croissance: {
            name: 'Croissance',
            baseReturn: 0.085,
            emoji: '🚀',
            adjective: 'dynamique',
            description: 'Vous êtes à l\'aise avec la volatilité et visez la croissance à long terme. Les actions domineront votre portefeuille.'
        }
    };

    // ── Questionnaire Data ──
    const QUIZ_QUESTIONS = [
        {
            question: 'Quel est votre objectif principal?',
            subtitle: 'Choisissez ce qui vous représente le mieux.',
            options: [
                { emoji: '🛡️', text: 'Protéger ce que j\'ai', score: 1 },
                { emoji: '🏠', text: 'Acheter une maison', score: 1 },
                { emoji: '🏖️', text: 'Préparer ma retraite', score: 2 },
                { emoji: '📈', text: 'Faire croître mon capital', score: 3 }
            ]
        },
        {
            question: 'Que feriez-vous si vos placements perdaient 20% en un mois?',
            subtitle: 'Soyez honnête, il n\'y a pas de mauvaise réponse.',
            options: [
                { emoji: '😰', text: 'Je vends tout immédiatement', score: 1 },
                { emoji: '⏳', text: 'J\'attends sans rien faire', score: 2 },
                { emoji: '💪', text: 'J\'investis davantage, c\'est une opportunité', score: 3 }
            ]
        },
        {
            question: 'Quel est votre horizon de temps?',
            subtitle: 'Quand aurez-vous besoin de cet argent?',
            options: [
                { emoji: '⏱️', text: 'Moins de 3 ans', score: 1 },
                { emoji: '📅', text: '3 à 10 ans', score: 2 },
                { emoji: '🗓️', text: '10 à 20 ans', score: 2 },
                { emoji: '♾️', text: 'Plus de 20 ans', score: 3 }
            ]
        },
        {
            question: 'Comment décririez-vous vos connaissances financières?',
            subtitle: 'Votre expérience avec les investissements.',
            options: [
                { emoji: '🌱', text: 'Débutant — je commence à peine', score: 1 },
                { emoji: '📊', text: 'Intermédiaire — je connais les bases', score: 2 },
                { emoji: '🎯', text: 'Avancé — je suis très à l\'aise', score: 3 }
            ]
        },
        {
            question: 'Quelle part de votre épargne êtes-vous prêt à investir?',
            subtitle: 'Le montant que vous pouvez placer à long terme.',
            options: [
                { emoji: '💧', text: 'Moins de 25%', score: 1 },
                { emoji: '🌊', text: 'Entre 25% et 50%', score: 2 },
                { emoji: '🌊', text: 'Plus de 50%', score: 3 }
            ]
        }
    ];

    // ── State ──
    let state = {
        amount: 100000,
        horizon: 15,
        profile: 'equilibre',
        cycle: 'expansion'
    };

    let quizState = {
        currentQuestion: 0,
        answers: [],
        totalScore: 0
    };

    // ── DOM Elements ──
    let els = {};

    function init() {
        els = {
            amountSlider: document.getElementById('compas-amount'),
            amountValue: document.getElementById('compas-amount-value'),
            horizonSlider: document.getElementById('compas-horizon'),
            horizonValue: document.getElementById('compas-horizon-value'),
            profileBtns: document.querySelectorAll('.profile-btn'),
            chartSvg: document.getElementById('compas-svg-chart'),
            bigNumber: document.getElementById('compas-big-number'),
            subtitle: document.getElementById('compas-subtitle'),
            aiText: document.getElementById('compas-ai-text'),
            cycleIndicator: document.getElementById('compas-cycle-indicator'),
            cycleName: document.getElementById('compas-cycle-name'),
            cycleDesc: document.getElementById('compas-cycle-desc'),
            statGain: document.getElementById('stat-gain'),
            statReturn: document.getElementById('stat-return'),
            statAlloc: document.getElementById('stat-alloc'),
            // V2
            discoverBtn: document.getElementById('compas-discover-btn'),
            quizOverlay: document.getElementById('quiz-overlay'),
            quizClose: document.getElementById('quiz-close'),
            quizProgressFill: document.getElementById('quiz-progress-fill'),
            quizProgressText: document.getElementById('quiz-progress-text'),
            quizCards: document.querySelectorAll('.quiz-card'),
            quizResult: document.getElementById('quiz-result'),
            quizResultIcon: document.getElementById('quiz-result-icon'),
            quizResultProfile: document.getElementById('quiz-result-profile'),
            quizResultDesc: document.getElementById('quiz-result-desc'),
            quizApplyBtn: document.getElementById('quiz-apply-btn')
        };

        if (!els.amountSlider) return;

        // Detect current cycle
        detectCurrentCycle();

        // Event listeners
        els.amountSlider.addEventListener('input', onAmountChange);
        els.horizonSlider.addEventListener('input', onHorizonChange);
        els.profileBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                els.profileBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.profile = btn.dataset.profile;
                update();
            });
        });

        // Cycle indicator click → scroll to radar
        if (els.cycleIndicator) {
            els.cycleIndicator.addEventListener('click', () => {
                const cycleSection = document.getElementById('cycle-economique');
                if (cycleSection) {
                    cycleSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }

        // Listen for cycle changes from radar
        document.querySelectorAll('.radar-quadrant').forEach(q => {
            q.addEventListener('click', () => {
                setTimeout(() => detectCurrentCycle(), 100);
            });
        });

        // V2: Questionnaire
        if (els.discoverBtn) {
            els.discoverBtn.addEventListener('click', openQuiz);
        }
        if (els.quizClose) {
            els.quizClose.addEventListener('click', closeQuiz);
        }
        if (els.quizOverlay) {
            els.quizOverlay.addEventListener('click', (e) => {
                if (e.target === els.quizOverlay) closeQuiz();
            });
        }
        if (els.quizApplyBtn) {
            els.quizApplyBtn.addEventListener('click', applyQuizResult);
        }

        // Wire up quiz option clicks
        document.querySelectorAll('.quiz-option').forEach(opt => {
            opt.addEventListener('click', onQuizOptionClick);
        });

        update();
    }

    // ── Cycle Detection ──
    function detectCurrentCycle() {
        const activeQuadrant = document.querySelector('.radar-quadrant.active');
        if (activeQuadrant) {
            state.cycle = activeQuadrant.dataset.phase;
            updateCycleIndicator();
            update();
        }
    }

    function updateCycleIndicator() {
        const cycle = CYCLE_DATA[state.cycle];
        if (!cycle) return;
        if (els.cycleIndicator) {
            els.cycleIndicator.className = 'compas-cycle-indicator ' + state.cycle;
        }
        if (els.cycleName) {
            els.cycleName.textContent = 'Cycle actif : ' + cycle.name;
        }
        if (els.cycleDesc) {
            els.cycleDesc.textContent = cycle.description;
        }
    }

    // ── Sliders ──
    function onAmountChange(e) {
        state.amount = parseInt(e.target.value);
        els.amountValue.textContent = formatCurrency(state.amount);
        updateSliderFill(e.target);
        update();
    }

    function onHorizonChange(e) {
        state.horizon = parseInt(e.target.value);
        els.horizonValue.textContent = state.horizon + ' ans';
        updateSliderFill(e.target);
        update();
    }

    function updateSliderFill(slider) {
        const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.background = `linear-gradient(90deg, #0077b6 ${pct}%, #e2ecf2 ${pct}%)`;
    }

    // ── Calculator ──
    function calculate() {
        const profile = PROFILES[state.profile];
        const cycle = CYCLE_DATA[state.cycle];
        const adjustedReturn = profile.baseReturn * cycle.returnModifier;

        const points = [];
        let value = state.amount;
        for (let year = 0; year <= state.horizon; year++) {
            points.push({ year, value: Math.round(value) });
            const noise = 1 + (Math.sin(year * 1.7 + state.amount * 0.00001) * 0.02);
            value *= (1 + adjustedReturn * noise);
        }

        const finalValue = points[points.length - 1].value;
        const totalGain = finalValue - state.amount;
        const annualReturn = adjustedReturn * 100;

        return { points, finalValue, totalGain, annualReturn, adjustedReturn };
    }

    // ── Update All ──
    function update() {
        const result = calculate();
        const cycle = CYCLE_DATA[state.cycle];
        const profile = PROFILES[state.profile];

        if (els.bigNumber) els.bigNumber.textContent = formatCurrency(result.finalValue);
        if (els.subtitle) els.subtitle.textContent = `Projection sur ${state.horizon} ans`;
        if (els.statGain) els.statGain.textContent = formatCurrency(result.totalGain);
        if (els.statReturn) els.statReturn.textContent = result.annualReturn.toFixed(1) + '%';
        if (els.statAlloc) els.statAlloc.textContent = cycle.allocation.actions + '% Actions';

        drawChart(result.points);
        generateAnalysis(result, cycle, profile);
    }

    // ── SVG Chart ──
    function drawChart(points) {
        if (!els.chartSvg) return;

        const width = 600, height = 180;
        const padding = { top: 20, right: 20, bottom: 30, left: 10 };
        const xScale = (i) => padding.left + (i / (points.length - 1)) * (width - padding.left - padding.right);
        const maxVal = Math.max(...points.map(p => p.value));
        const minVal = Math.min(...points.map(p => p.value));
        const range = maxVal - minVal || 1;
        const yScale = (v) => padding.top + (1 - (v - minVal) / range) * (height - padding.top - padding.bottom);

        let linePath = `M ${xScale(0)} ${yScale(points[0].value)}`;
        let areaPath = `M ${xScale(0)} ${height - padding.bottom} L ${xScale(0)} ${yScale(points[0].value)}`;
        for (let i = 1; i < points.length; i++) {
            const x = xScale(i), y = yScale(points[i].value);
            const prevX = xScale(i - 1), prevY = yScale(points[i - 1].value);
            const cpx = (prevX + x) / 2;
            linePath += ` C ${cpx} ${prevY}, ${cpx} ${y}, ${x} ${y}`;
            areaPath += ` C ${cpx} ${prevY}, ${cpx} ${y}, ${x} ${y}`;
        }
        areaPath += ` L ${xScale(points.length - 1)} ${height - padding.bottom} Z`;

        let gridLines = '';
        for (let i = 0; i < 4; i++) {
            const y = padding.top + (i / 3) * (height - padding.top - padding.bottom);
            gridLines += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="chart-gridline"/>`;
        }

        let yearLabels = '';
        const step = points.length <= 10 ? 1 : Math.ceil(points.length / 6);
        for (let i = 0; i < points.length; i += step) {
            yearLabels += `<text x="${xScale(i)}" y="${height - 5}" class="chart-year-label">An ${points[i].year}</text>`;
        }
        if ((points.length - 1) % step !== 0) {
            yearLabels += `<text x="${xScale(points.length - 1)}" y="${height - 5}" class="chart-year-label">An ${points[points.length - 1].year}</text>`;
        }

        els.chartSvg.innerHTML = `
            <defs>
                <linearGradient id="compas-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#0077b6"/>
                    <stop offset="100%" stop-color="#00b4d8"/>
                </linearGradient>
                <linearGradient id="compas-area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#0077b6" stop-opacity="0.2"/>
                    <stop offset="100%" stop-color="#0077b6" stop-opacity="0"/>
                </linearGradient>
            </defs>
            ${gridLines}
            <path d="${areaPath}" class="chart-area"/>
            <path d="${linePath}" class="chart-line"/>
            ${yearLabels}
        `;
    }

    // ── AI Text Engine ──
    function generateAnalysis(result, cycle, profile) {
        if (!els.aiText) return;
        els.aiText.style.opacity = '0';
        setTimeout(() => {
            els.aiText.innerHTML = buildAnalysisText(result, cycle, profile);
            els.aiText.style.opacity = '1';
        }, 300);
    }

    function buildAnalysisText(result, cycle, profile) {
        const amount = state.amount;
        const horizon = state.horizon;
        const gain = result.totalGain;

        let opening;
        if (amount >= 500000 && horizon <= 7)
            opening = `<span class="ai-emoji">${cycle.emoji}</span> <strong>Capital important, horizon court.</strong> `;
        else if (amount >= 500000 && horizon > 15)
            opening = `<span class="ai-emoji">${cycle.emoji}</span> <strong>Patrimoine majeur avec vision long terme.</strong> `;
        else if (amount < 50000 && horizon > 20)
            opening = `<span class="ai-emoji">${cycle.emoji}</span> <strong>Le temps est votre meilleur allié.</strong> `;
        else if (horizon <= 5)
            opening = `<span class="ai-emoji">${cycle.emoji}</span> <strong>Horizon court détecté.</strong> `;
        else
            opening = `<span class="ai-emoji">${cycle.emoji}</span> <strong>Profil ${profile.adjective} identifié.</strong> `;

        let cycleAnalysis;
        switch (state.cycle) {
            case 'expansion':
                cycleAnalysis = `En phase d'<strong>Expansion</strong>, les marchés offrent un terrain favorable. Notre modèle recommande une allocation de <strong>${cycle.allocation.actions}% en actions</strong> pour capter la croissance, tout en maintenant ${cycle.allocation.alternatif}% en actifs alternatifs comme filet de sécurité.`;
                break;
            case 'surchauffe':
                cycleAnalysis = `La phase de <strong>Surchauffe</strong> actuelle commande la prudence. L'I.A. détecte des signaux de tension sur les marchés et recommande de réduire l'exposition aux actions à <strong>${cycle.allocation.actions}%</strong> et d'augmenter les obligations à <strong>${cycle.allocation.obligations}%</strong> pour absorber la volatilité ${cycle.volatility}.`;
                break;
            case 'recession':
                cycleAnalysis = `En période de <strong>Récession</strong>, la stratégie de <strong>${cycle.strategy}</strong> est primordiale. Le Compas recommande <strong>${cycle.allocation.obligations}% en obligations</strong> et seulement ${cycle.allocation.actions}% en actions sélectives, privilégiant les secteurs défensifs et les dividendes stables.`;
                break;
            case 'reprise':
                cycleAnalysis = `La phase de <strong>Reprise</strong> est historiquement la plus lucrative pour les investisseurs positionnés tôt. Notre modèle favorise un <strong>${cycle.strategy}</strong> avec ${cycle.allocation.actions}% en actions orientées croissance et valeur, une fenêtre d'opportunité à ne pas manquer.`;
                break;
        }

        const multiplier = (result.finalValue / amount).toFixed(1);
        let insight;
        if (gain > amount)
            insight = ` Votre capital initial de <strong>${formatCurrency(amount)}</strong> pourrait être multiplié par <strong>${multiplier}x</strong> en ${horizon} ans, atteignant <strong>${formatCurrency(result.finalValue)}</strong>.`;
        else
            insight = ` Avec un rendement annualisé de <strong>${result.annualReturn.toFixed(1)}%</strong>, votre patrimoine pourrait croître de <strong>${formatCurrency(gain)}</strong> sur ${horizon} ans.`;

        let closing;
        if (horizon >= 20)
            closing = ' L\'effet des intérêts composés sur cette période rend chaque année supplémentaire exponentiellement plus puissante.';
        else if (horizon <= 5)
            closing = ' Sur un horizon aussi court, la préservation du capital prime sur le rendement.';
        else
            closing = ' Une révision annuelle avec votre conseiller permettra d\'ajuster la stratégie au fil des cycles.';

        return opening + cycleAnalysis + insight + closing;
    }

    // ═══════════════════════════════════════
    //  V2 — QUESTIONNAIRE
    // ═══════════════════════════════════════

    function openQuiz() {
        quizState = { currentQuestion: 0, answers: [], totalScore: 0 };
        // Reset UI
        els.quizCards.forEach(c => c.classList.remove('active'));
        if (els.quizResult) els.quizResult.classList.remove('active');
        document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
        // Show first question
        if (els.quizCards[0]) els.quizCards[0].classList.add('active');
        updateQuizProgress();
        // Open overlay
        if (els.quizOverlay) {
            els.quizOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeQuiz() {
        if (els.quizOverlay) {
            els.quizOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function onQuizOptionClick(e) {
        const option = e.currentTarget;
        const card = option.closest('.quiz-card');
        const questionIndex = parseInt(card.dataset.question);
        const score = parseInt(option.dataset.score);

        // Highlight selected
        card.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');

        // Record answer
        quizState.answers[questionIndex] = score;

        // Auto-advance after a short delay
        setTimeout(() => {
            if (questionIndex < QUIZ_QUESTIONS.length - 1) {
                // Next question
                card.classList.remove('active');
                quizState.currentQuestion = questionIndex + 1;
                els.quizCards[quizState.currentQuestion].classList.add('active');
                updateQuizProgress();
            } else {
                // Show result
                showQuizResult();
            }
        }, 400);
    }

    function updateQuizProgress() {
        const pct = ((quizState.currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;
        if (els.quizProgressFill) els.quizProgressFill.style.width = pct + '%';
        if (els.quizProgressText) els.quizProgressText.textContent = `Question ${quizState.currentQuestion + 1} / ${QUIZ_QUESTIONS.length}`;
    }

    function showQuizResult() {
        const total = quizState.answers.reduce((sum, s) => sum + s, 0);
        let profileKey;
        if (total <= 8) profileKey = 'prudent';
        else if (total <= 12) profileKey = 'equilibre';
        else profileKey = 'croissance';

        const profile = PROFILES[profileKey];

        // Hide all cards
        els.quizCards.forEach(c => c.classList.remove('active'));

        // Show result
        if (els.quizResult) {
            els.quizResult.classList.add('active');
        }
        if (els.quizResultIcon) els.quizResultIcon.textContent = profile.emoji;
        if (els.quizResultProfile) els.quizResultProfile.textContent = `Profil ${profile.name}`;
        if (els.quizResultDesc) els.quizResultDesc.textContent = profile.description;

        // Store for apply
        quizState.detectedProfile = profileKey;

        // Progress to 100%
        if (els.quizProgressFill) els.quizProgressFill.style.width = '100%';
        if (els.quizProgressText) els.quizProgressText.textContent = 'Résultat';
    }

    function applyQuizResult() {
        if (quizState.detectedProfile) {
            state.profile = quizState.detectedProfile;
            // Update profile buttons
            els.profileBtns.forEach(b => {
                b.classList.toggle('active', b.dataset.profile === state.profile);
            });
            update();
        }
        closeQuiz();

        // Scroll to compas
        const compasSection = document.getElementById('compas');
        if (compasSection) {
            compasSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // ── Helpers ──
    function formatCurrency(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2).replace('.', ',') + ' M$';
        }
        return num.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    // ── Boot ──
    document.addEventListener('DOMContentLoaded', () => {
        init();
        document.querySelectorAll('.compas-range').forEach(updateSliderFill);
    });
})();
