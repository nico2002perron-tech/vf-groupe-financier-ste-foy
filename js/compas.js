/* =========================================
   COMPAS PATRIMONIAL I.A. — ENGINE V3
   Calculator · AI Text · SVG Chart
   Questionnaire · Tooltips · Cycle-Linked
   3 Scenarios · Probability Cone · Goal
   PDF Export
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
            color: '#10b981',
            description: 'Vous privilégiez la sécurité et la stabilité. Votre portefeuille sera axé sur les obligations et les placements à faible volatilité.'
        },
        equilibre: {
            name: 'Équilibré',
            baseReturn: 0.065,
            emoji: '⚖️',
            adjective: 'équilibrée',
            color: '#0077b6',
            description: 'Vous recherchez un juste milieu entre croissance et sécurité. Un mix diversifié d\'actions et d\'obligations est idéal pour vous.'
        },
        croissance: {
            name: 'Croissance',
            baseReturn: 0.085,
            emoji: '🚀',
            adjective: 'dynamique',
            color: '#f59e0b',
            description: 'Vous êtes à l\'aise avec la volatilité et visez la croissance à long terme. Les actions domineront votre portefeuille.'
        }
    };

    // Profile draw order (bottom to top for visual layering)
    const PROFILE_KEYS = ['prudent', 'equilibre', 'croissance'];

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
        cycle: 'expansion',
        goalAmount: null
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
            goalSlider: document.getElementById('compas-goal'),
            goalValue: document.getElementById('compas-goal-value'),
            goalBadge: document.getElementById('goal-badge'),
            goalBadgeText: document.getElementById('goal-badge-text'),
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
            pdfBtn: document.getElementById('compas-pdf-btn'),
            clientName: document.getElementById('compas-client-name'),
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
        if (els.goalSlider) {
            els.goalSlider.addEventListener('input', onGoalChange);
        }
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

        // V3: PDF button
        if (els.pdfBtn) {
            els.pdfBtn.addEventListener('click', generatePDF);
        }

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

    function onGoalChange(e) {
        const val = parseInt(e.target.value);
        if (val === 0) {
            state.goalAmount = null;
            if (els.goalValue) els.goalValue.textContent = 'Désactivé';
        } else {
            state.goalAmount = val;
            if (els.goalValue) els.goalValue.textContent = formatCurrency(val);
        }
        updateSliderFill(e.target);
        update();
    }

    function updateSliderFill(slider) {
        const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.background = `linear-gradient(90deg, #0077b6 ${pct}%, #e2ecf2 ${pct}%)`;
    }

    // ── Calculator ──
    function calculateForProfile(profileKey) {
        const profile = PROFILES[profileKey];
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

    function calculateAllProfiles() {
        const results = {};
        PROFILE_KEYS.forEach(key => {
            results[key] = calculateForProfile(key);
        });
        return results;
    }

    function calculateCone(adjustedReturn, horizon, amount) {
        const optimistReturn = Math.min(adjustedReturn + 0.03, adjustedReturn * 1.8);
        const pessimistReturn = Math.max(adjustedReturn - 0.03, 0.005);

        const optimiste = [];
        const moyen = [];
        const pessimiste = [];

        let valOpt = amount, valMoy = amount, valPes = amount;
        for (let year = 0; year <= horizon; year++) {
            optimiste.push({ year, value: Math.round(valOpt) });
            moyen.push({ year, value: Math.round(valMoy) });
            pessimiste.push({ year, value: Math.round(valPes) });

            const noise = 1 + (Math.sin(year * 1.7 + amount * 0.00001) * 0.02);
            valOpt *= (1 + optimistReturn * noise);
            valMoy *= (1 + adjustedReturn * noise);
            valPes *= (1 + pessimistReturn * noise);
        }

        return { optimiste, moyen, pessimiste };
    }

    function calculateGoalYear(points, goalAmount) {
        for (let i = 0; i < points.length; i++) {
            if (points[i].value >= goalAmount) {
                return { year: points[i].year, index: i, achieved: true };
            }
        }
        return { year: null, index: null, achieved: false };
    }

    // ── Update All ──
    function update() {
        const allResults = calculateAllProfiles();
        const activeResult = allResults[state.profile];
        const cycle = CYCLE_DATA[state.cycle];
        const profile = PROFILES[state.profile];

        // Calculate cone for active profile
        const cone = calculateCone(activeResult.adjustedReturn, state.horizon, state.amount);

        if (els.bigNumber) els.bigNumber.textContent = formatCurrency(activeResult.finalValue);
        if (els.subtitle) els.subtitle.textContent = `Projection sur ${state.horizon} ans`;
        if (els.statGain) els.statGain.textContent = formatCurrency(activeResult.totalGain);
        if (els.statReturn) els.statReturn.textContent = activeResult.annualReturn.toFixed(1) + '%';
        if (els.statAlloc) els.statAlloc.textContent = cycle.allocation.actions + '% Actions';

        drawChart(allResults, cone);
        updateGoalBadge(activeResult.points);
        generateAnalysis(activeResult, cycle, profile);
    }

    // ── Goal Badge ──
    function updateGoalBadge(points) {
        if (!els.goalBadge) return;

        if (!state.goalAmount) {
            els.goalBadge.style.display = 'none';
            return;
        }

        const goalResult = calculateGoalYear(points, state.goalAmount);
        els.goalBadge.style.display = 'flex';

        if (goalResult.achieved) {
            els.goalBadge.className = 'goal-badge achieved';
            els.goalBadgeText.textContent = `Objectif atteint en ${goalResult.year} an${goalResult.year > 1 ? 's' : ''}`;
            // Update lucide icon to check-circle
            const icon = els.goalBadge.querySelector('i, svg');
            if (icon) {
                icon.setAttribute('data-lucide', 'check-circle');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        } else {
            els.goalBadge.className = 'goal-badge not-achieved';
            els.goalBadgeText.textContent = `Objectif non atteint sur ${state.horizon} ans — augmentez l'horizon ou le montant`;
            const icon = els.goalBadge.querySelector('i, svg');
            if (icon) {
                icon.setAttribute('data-lucide', 'alert-circle');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        }
    }

    // ── SVG Chart ──
    function drawChart(allResults, cone) {
        if (!els.chartSvg) return;

        const width = 600, height = 240;
        const padding = { top: 20, right: 20, bottom: 30, left: 10 };
        const chartBottom = height - padding.bottom;

        // Find global min/max across all profiles + cone
        let globalMax = 0, globalMin = Infinity;
        PROFILE_KEYS.forEach(key => {
            allResults[key].points.forEach(p => {
                if (p.value > globalMax) globalMax = p.value;
                if (p.value < globalMin) globalMin = p.value;
            });
        });
        // Include cone bounds
        if (cone) {
            cone.optimiste.forEach(p => { if (p.value > globalMax) globalMax = p.value; });
            cone.pessimiste.forEach(p => { if (p.value < globalMin) globalMin = p.value; });
        }
        // Include goal line in scale
        if (state.goalAmount) {
            if (state.goalAmount > globalMax) globalMax = state.goalAmount * 1.05;
        }

        const range = globalMax - globalMin || 1;
        const numPoints = allResults[state.profile].points.length;

        const xScale = (i) => padding.left + (i / (numPoints - 1)) * (width - padding.left - padding.right);
        const yScale = (v) => padding.top + (1 - (v - globalMin) / range) * (chartBottom - padding.top);

        // Helper: build cubic bezier path from points array
        function buildLinePath(points) {
            let path = `M ${xScale(0)} ${yScale(points[0].value)}`;
            for (let i = 1; i < points.length; i++) {
                const x = xScale(i), y = yScale(points[i].value);
                const prevX = xScale(i - 1), prevY = yScale(points[i - 1].value);
                const cpx = (prevX + x) / 2;
                path += ` C ${cpx} ${prevY}, ${cpx} ${y}, ${x} ${y}`;
            }
            return path;
        }

        function buildAreaPath(points) {
            let path = `M ${xScale(0)} ${chartBottom} L ${xScale(0)} ${yScale(points[0].value)}`;
            for (let i = 1; i < points.length; i++) {
                const x = xScale(i), y = yScale(points[i].value);
                const prevX = xScale(i - 1), prevY = yScale(points[i - 1].value);
                const cpx = (prevX + x) / 2;
                path += ` C ${cpx} ${prevY}, ${cpx} ${y}, ${x} ${y}`;
            }
            path += ` L ${xScale(points.length - 1)} ${chartBottom} Z`;
            return path;
        }

        // ── Grid Lines ──
        let gridLines = '';
        for (let i = 0; i < 4; i++) {
            const y = padding.top + (i / 3) * (chartBottom - padding.top);
            gridLines += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="chart-gridline"/>`;
        }

        // ── Year Labels ──
        const points = allResults[state.profile].points;
        let yearLabels = '';
        const step = points.length <= 10 ? 1 : Math.ceil(points.length / 6);
        for (let i = 0; i < points.length; i += step) {
            yearLabels += `<text x="${xScale(i)}" y="${height - 5}" class="chart-year-label">An ${points[i].year}</text>`;
        }
        if ((points.length - 1) % step !== 0) {
            yearLabels += `<text x="${xScale(points.length - 1)}" y="${height - 5}" class="chart-year-label">An ${points[points.length - 1].year}</text>`;
        }

        // ── Defs (gradients) ──
        let defs = '<defs>';
        PROFILE_KEYS.forEach(key => {
            const color = PROFILES[key].color;
            defs += `
                <linearGradient id="area-grad-${key}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${color}" stop-opacity="0.2"/>
                    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
                </linearGradient>`;
        });
        // Cone gradient for active profile
        const activeColor = PROFILES[state.profile].color;
        defs += `
            <linearGradient id="cone-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="${activeColor}" stop-opacity="0.08"/>
                <stop offset="100%" stop-color="${activeColor}" stop-opacity="0.02"/>
            </linearGradient>`;
        defs += '</defs>';

        // ── Cone (probability area) ──
        let coneSvg = '';
        if (cone) {
            // Build path: go forward along optimiste, then backward along pessimiste
            let conePath = `M ${xScale(0)} ${yScale(cone.optimiste[0].value)}`;
            for (let i = 1; i < cone.optimiste.length; i++) {
                const x = xScale(i), y = yScale(cone.optimiste[i].value);
                const prevX = xScale(i - 1), prevY = yScale(cone.optimiste[i - 1].value);
                const cpx = (prevX + x) / 2;
                conePath += ` C ${cpx} ${prevY}, ${cpx} ${y}, ${x} ${y}`;
            }
            // Go backward along pessimiste
            for (let i = cone.pessimiste.length - 1; i >= 1; i--) {
                const x = xScale(i), y = yScale(cone.pessimiste[i].value);
                const nextX = xScale(i - 1), nextY = yScale(cone.pessimiste[i - 1].value);
                // Reverse bezier
                const cpx = (x + nextX) / 2;
                if (i === cone.pessimiste.length - 1) {
                    conePath += ` L ${x} ${y}`;
                }
                conePath += ` C ${cpx} ${y}, ${cpx} ${nextY}, ${nextX} ${nextY}`;
            }
            conePath += ' Z';

            coneSvg = `<path d="${conePath}" class="chart-cone" fill="url(#cone-grad)"/>`;

            // Cone borders (dashed)
            const optPath = buildLinePath(cone.optimiste);
            const pesPath = buildLinePath(cone.pessimiste);
            coneSvg += `<path d="${optPath}" class="chart-cone-border" stroke="${activeColor}"/>`;
            coneSvg += `<path d="${pesPath}" class="chart-cone-border" stroke="${activeColor}"/>`;
        }

        // ── Profile Curves ──
        let curvesSvg = '';
        // Draw inactive profiles first, then active on top
        PROFILE_KEYS.forEach(key => {
            const isActive = key === state.profile;
            const color = PROFILES[key].color;
            const pts = allResults[key].points;
            const linePath = buildLinePath(pts);
            const areaPath = buildAreaPath(pts);

            if (isActive) {
                curvesSvg += `<path d="${areaPath}" fill="url(#area-grad-${key})" class="chart-area-multi-active"/>`;
                curvesSvg += `<path d="${linePath}" stroke="${color}" class="chart-line-active"/>`;
            } else {
                curvesSvg += `<path d="${areaPath}" fill="url(#area-grad-${key})" class="chart-area-multi"/>`;
                curvesSvg += `<path d="${linePath}" stroke="${color}" class="chart-line-inactive"/>`;
            }
        });

        // ── Goal Line ──
        let goalSvg = '';
        if (state.goalAmount && state.goalAmount > globalMin) {
            const goalY = yScale(state.goalAmount);
            if (goalY >= padding.top && goalY <= chartBottom) {
                goalSvg += `<line x1="${padding.left}" y1="${goalY}" x2="${width - padding.right}" y2="${goalY}" class="chart-goal-line"/>`;
                goalSvg += `<text x="${width - padding.right - 4}" y="${goalY - 6}" class="chart-goal-label" text-anchor="end">${formatCurrencyShort(state.goalAmount)}</text>`;

                // Find intersection point with active profile
                const activePoints = allResults[state.profile].points;
                const goalResult = calculateGoalYear(activePoints, state.goalAmount);
                if (goalResult.achieved) {
                    const gx = xScale(goalResult.index);
                    goalSvg += `<circle cx="${gx}" cy="${goalY}" r="4" class="chart-goal-dot"/>`;
                }
            }
        }

        // ── Legend (top right) ──
        let legendSvg = '';
        const legendX = width - padding.right - 130;
        const legendY = padding.top + 2;
        PROFILE_KEYS.forEach((key, i) => {
            const color = PROFILES[key].color;
            const isActive = key === state.profile;
            const ly = legendY + i * 16;
            const finalVal = formatCurrencyShort(allResults[key].finalValue);
            const opacity = isActive ? 1 : 0.5;
            const weight = isActive ? 800 : 600;
            legendSvg += `<g class="chart-legend-item" opacity="${opacity}">`;
            legendSvg += `<line x1="${legendX}" y1="${ly + 4}" x2="${legendX + 16}" y2="${ly + 4}" stroke="${color}" stroke-width="${isActive ? 3 : 1.5}" stroke-linecap="round"/>`;
            legendSvg += `<text x="${legendX + 22}" y="${ly + 8}" fill="${color}" style="font-weight:${weight}">${PROFILES[key].name}</text>`;
            legendSvg += `<text x="${legendX + 130}" y="${ly + 8}" class="chart-legend-value" text-anchor="end">${finalVal}</text>`;
            legendSvg += `</g>`;
        });

        // ── Assemble ──
        els.chartSvg.innerHTML = defs + gridLines + coneSvg + curvesSvg + goalSvg + yearLabels + legendSvg;
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

    // ═══════════════════════════════════════
    //  V3 — PDF EXPORT
    // ═══════════════════════════════════════

    function generatePDF() {
        if (typeof window.jspdf === 'undefined') {
            alert('La librairie PDF n\'est pas encore chargée. Veuillez réessayer dans quelques secondes.');
            return;
        }

        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF('p', 'mm', 'letter');
        var pageW = doc.internal.pageSize.getWidth();
        var margin = 20;
        var contentW = pageW - margin * 2;
        var y = margin;

        var clientName = els.clientName ? els.clientName.value.trim() : '';
        var profile = PROFILES[state.profile];
        var cycle = CYCLE_DATA[state.cycle];
        var activeResult = calculateForProfile(state.profile);
        var today = new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });

        // ── Header ──
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 119, 182);
        doc.text('Compas Patrimonial I.A.', margin, y);
        y += 7;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(90, 125, 149);
        doc.text('Groupe Financier Ste-Foy', margin, y);

        // Date + Name (right-aligned)
        doc.setFontSize(9);
        doc.text(today, pageW - margin, y, { align: 'right' });
        y += 5;
        if (clientName) {
            doc.setFont(undefined, 'bold');
            doc.setTextColor(10, 37, 64);
            doc.text('Prepare pour : ' + clientName, pageW - margin, y, { align: 'right' });
        }
        y += 10;

        // Separator line
        doc.setDrawColor(0, 119, 182);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageW - margin, y);
        y += 10;

        // ── Section: Profil d'investisseur ──
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(10, 37, 64);
        doc.text('Profil d\'investisseur', margin, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(44, 74, 94);

        var profileLines = [
            ['Profil de risque', profile.name],
            ['Rendement annuel estime', activeResult.annualReturn.toFixed(1) + '%'],
            ['Cycle economique actif', cycle.name + ' (' + cycle.emoji + ')'],
            ['Strategie recommandee', cycle.strategy],
            ['Allocation', cycle.allocation.actions + '% Actions / ' + cycle.allocation.obligations + '% Obligations / ' + cycle.allocation.alternatif + '% Alternatif']
        ];

        profileLines.forEach(function(row) {
            doc.setFont(undefined, 'bold');
            doc.setTextColor(90, 125, 149);
            doc.text(row[0] + ' :', margin, y);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(10, 37, 64);
            doc.text(row[1], margin + 55, y);
            y += 6;
        });
        y += 6;

        // ── Section: Parametres ──
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(10, 37, 64);
        doc.text('Parametres de simulation', margin, y);
        y += 8;

        doc.setFontSize(10);
        var paramLines = [
            ['Montant initial', formatCurrency(state.amount)],
            ['Horizon de placement', state.horizon + ' ans']
        ];
        if (state.goalAmount) {
            paramLines.push(['Objectif financier', formatCurrency(state.goalAmount)]);
        }

        paramLines.forEach(function(row) {
            doc.setFont(undefined, 'bold');
            doc.setTextColor(90, 125, 149);
            doc.text(row[0] + ' :', margin, y);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(10, 37, 64);
            doc.text(row[1], margin + 55, y);
            y += 6;
        });
        y += 6;

        // ── Section: Projection ──
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(10, 37, 64);
        doc.text('Resultats de la projection', margin, y);
        y += 8;

        doc.setFontSize(10);
        var resultLines = [
            ['Valeur finale projetee', formatCurrency(activeResult.finalValue)],
            ['Gain projete', formatCurrency(activeResult.totalGain)],
            ['Multiplicateur', (activeResult.finalValue / state.amount).toFixed(1) + 'x']
        ];

        if (state.goalAmount) {
            var goalRes = calculateGoalYear(activeResult.points, state.goalAmount);
            if (goalRes.achieved) {
                resultLines.push(['Objectif atteint en', goalRes.year + ' ans']);
            } else {
                resultLines.push(['Objectif', 'Non atteint sur ' + state.horizon + ' ans']);
            }
        }

        resultLines.forEach(function(row) {
            doc.setFont(undefined, 'bold');
            doc.setTextColor(90, 125, 149);
            doc.text(row[0] + ' :', margin, y);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 119, 182);
            doc.text(row[1], margin + 55, y);
            y += 6;
        });
        y += 6;

        // ── Section: Chart Image ──
        try {
            var svgEl = els.chartSvg;
            if (svgEl) {
                var svgData = new XMLSerializer().serializeToString(svgEl);
                // Create a canvas to render SVG
                var canvas = document.createElement('canvas');
                canvas.width = 1200;
                canvas.height = 480;
                var ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                var img = new Image();
                var svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                var url = URL.createObjectURL(svgBlob);

                // Use synchronous approach: draw chart placeholder text for now
                // The async image load will be handled with a promise
                var chartPromise = new Promise(function(resolve) {
                    img.onload = function() {
                        ctx.drawImage(img, 0, 0, 1200, 480);
                        URL.revokeObjectURL(url);
                        var dataUrl = canvas.toDataURL('image/png');
                        resolve(dataUrl);
                    };
                    img.onerror = function() {
                        URL.revokeObjectURL(url);
                        resolve(null);
                    };
                    img.src = url;
                });

                chartPromise.then(function(dataUrl) {
                    if (dataUrl) {
                        doc.setFontSize(13);
                        doc.setFont(undefined, 'bold');
                        doc.setTextColor(10, 37, 64);
                        doc.text('Graphique de projection', margin, y);
                        y += 4;

                        var chartH = contentW * 0.4;
                        doc.addImage(dataUrl, 'PNG', margin, y, contentW, chartH);
                        y += chartH + 8;

                        finalizePDF(doc, y, margin, pageW, contentW, activeResult, cycle, profile, clientName);
                    } else {
                        finalizePDF(doc, y, margin, pageW, contentW, activeResult, cycle, profile, clientName);
                    }
                });
                return; // async path
            }
        } catch (e) {
            // If SVG conversion fails, continue without chart
        }

        finalizePDF(doc, y, margin, pageW, contentW, activeResult, cycle, profile, clientName);
    }

    function finalizePDF(doc, y, margin, pageW, contentW, result, cycle, profile, clientName) {
        // ── Section: AI Analysis ──
        if (y > 220) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(10, 37, 64);
        doc.text('Analyse du Compas I.A.', margin, y);
        y += 8;

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(44, 74, 94);

        // Get plain text from analysis
        var analysisText = buildAnalysisText(result, cycle, profile);
        var plainText = analysisText.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');

        var splitText = doc.splitTextToSize(plainText, contentW);
        doc.text(splitText, margin, y);
        y += splitText.length * 4.5 + 10;

        // ── Disclaimer + Footer ──
        if (y > 240) {
            doc.addPage();
            y = 20;
        }

        // Separator
        doc.setDrawColor(200, 210, 220);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageW - margin, y);
        y += 8;

        doc.setFontSize(7.5);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(160, 180, 196);
        var disclaimer = 'Simulation a titre indicatif seulement. Les rendements passes ne garantissent pas les rendements futurs. Ce document ne constitue pas un conseil financier. Consultez un professionnel avant de prendre toute decision d\'investissement.';
        var disclaimerLines = doc.splitTextToSize(disclaimer, contentW);
        doc.text(disclaimerLines, margin, y);
        y += disclaimerLines.length * 3.5 + 8;

        doc.setFont(undefined, 'normal');
        doc.setTextColor(90, 125, 149);
        doc.setFontSize(8);
        doc.text('Groupe Financier Ste-Foy', margin, y);
        doc.text('418-577-2087 | groupefinancierstefoy.com', pageW - margin, y, { align: 'right' });

        // Save
        var fileName = 'Compas-Patrimonial';
        if (clientName) {
            fileName += '-' + clientName.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, '-');
        }
        doc.save(fileName + '.pdf');
    }

    // ── Helpers ──
    function formatCurrency(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2).replace('.', ',') + ' M$';
        }
        return num.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    function formatCurrencyShort(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace('.', ',') + 'M$';
        }
        if (num >= 1000) {
            return Math.round(num / 1000) + 'k$';
        }
        return num.toLocaleString('fr-CA') + '$';
    }

    // ── Boot ──
    document.addEventListener('DOMContentLoaded', () => {
        init();
        document.querySelectorAll('.compas-range').forEach(updateSliderFill);
    });
})();
