/* =========================================
   RADAR I.A. - MODE SERVEUR UNIQUE
   Design Premium avec Animations
   ========================================= */

// URL de l'API (Même domaine Vercel)
const API_URL = '/api/analyze-news';

// Fonction principale
async function loadNewsGratuit(sector) {
    const container = document.getElementById('news-container');

    if (!container) return;

    container.innerHTML = `
        <div class="news-loading">
            <div class="loading-pulse">
                <div class="pulse-ring"></div>
                <div class="pulse-ring"></div>
                <div class="pulse-ring"></div>
                <i data-lucide="bot" style="width:28px; height:28px; color: #0077b6;"></i>
            </div>
            <p>🤖 Analyse I.A. en cours pour <strong>${getSectorName(sector)}</strong>...</p>
            <div class="loading-bar"><div class="loading-bar-inner"></div></div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();

    try {
        console.log("Calling API:", API_URL, "for sector:", sector);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sector: sector })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API error');
        }

        const data = await response.json();

        if (data.debug) {
            console.log("=== API DEBUG INFO ===");
            console.log("Groq Key:", data.debug.groqKey);
            console.log("Articles Received:", data.debug.articlesReceived);
            console.log("AI Called:", data.debug.aiCalled);
        }

        if (!data.success || !data.articles || data.articles.length === 0) {
            container.innerHTML = `
                <div class="news-empty">
                    <i data-lucide="inbox"></i>
                    <p>Aucune nouvelle disponible pour le moment.</p>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        // Afficher les cartes avec animation staggered
        container.innerHTML = data.articles.map((news, index) => createNewsCard(news, index)).join('');
        if (window.lucide) lucide.createIcons();

        // Déclencher les animations d'entrée
        requestAnimationFrame(() => {
            const cards = container.querySelectorAll('.news-card-premium');
            cards.forEach((card, i) => {
                setTimeout(() => card.classList.add('visible'), i * 150);
            });
        });

        // Mettre à jour le timestamp
        const updateEl = document.getElementById('last-update-time');
        if (updateEl) {
            const now = new Date();
            updateEl.textContent = `Dernière mise à jour : ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        }

    } catch (error) {
        console.error('Frontend Error:', error);
        container.innerHTML = `
            <div class="news-empty">
                <i data-lucide="alert-circle"></i>
                <p>Erreur lors de l'appel API. Vérifiez la console.</p>
                <p style="font-size: 0.85rem; margin-top: 10px; color: #94a3b8;">
                    ${error.message}
                </p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
    }
}

// Calculer le temps écoulé
function getTimeAgo(pubDate) {
    const diffMins = Math.floor((Date.now() - new Date(pubDate)) / 60000);
    if (diffMins < 60) return `${diffMins}min`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return `${Math.floor(diffMins / 1440)}j`;
}

// Nom du secteur
function getSectorName(sector) {
    const names = {
        all: 'tous les secteurs',
        health: 'santé',
        tech: 'technologie',
        crypto: 'crypto',
        industrial: 'industriel',
        energy: 'énergie',
        finance: 'finance',
        defensive: 'défensif'
    };
    return names[sector] || sector;
}

// Créer carte de nouvelle PREMIUM - SANS TICKERS
function createNewsCard(news, index = 0) {
    const isNew = news.isNew || (news.time && (news.time.includes('min') || (news.time.includes('h') && parseInt(news.time) < 3)));

    // Icône selon la source
    const sourceIcon = getSourceIcon(news.source);

    return `
        <div class="news-card-premium" style="--card-index: ${index}">
            <div class="card-accent-line"></div>
            <div class="card-body">
                <div class="card-header">
                    <div class="card-number">${String(index + 1).padStart(2, '0')}</div>
                    <div class="card-title-wrap">
                        <h3 class="news-title-premium">
                            ${news.title}
                        </h3>
                        ${isNew ? '<span class="badge-nouveau"><i data-lucide="zap" style="width:11px;height:11px;"></i> NOUVEAU</span>' : ''}
                    </div>
                </div>

                <p class="news-summary-premium">${news.summary}</p>

                <div class="card-footer">
                    <div class="card-meta">
                        <span class="meta-source">
                            ${sourceIcon}
                            ${news.source}
                        </span>
                        <span class="meta-separator">•</span>
                        <span class="meta-time">
                            <i data-lucide="clock" style="width:13px; height:13px;"></i>
                            Il y a ${news.time}
                        </span>
                    </div>
                    <a href="${news.link}" target="_blank" rel="noopener noreferrer" class="btn-read-article">
                        <span>Lire</span>
                        <i data-lucide="arrow-up-right" style="width:15px; height:15px;"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

function getSourceIcon(source) {
    const s = (source || '').toLowerCase();
    if (s.includes('presse')) return '<i data-lucide="newspaper" style="width:13px;height:13px;"></i>';
    if (s.includes('bloomberg')) return '<i data-lucide="bar-chart-2" style="width:13px;height:13px;"></i>';
    if (s.includes('cnbc')) return '<i data-lucide="tv" style="width:13px;height:13px;"></i>';
    if (s.includes('affaires')) return '<i data-lucide="briefcase" style="width:13px;height:13px;"></i>';
    if (s.includes('coin') || s.includes('crypto')) return '<i data-lucide="bitcoin" style="width:13px;height:13px;"></i>';
    if (s.includes('tech') || s.includes('verge')) return '<i data-lucide="cpu" style="width:13px;height:13px;"></i>';
    if (s.includes('radio-canada')) return '<i data-lucide="radio" style="width:13px;height:13px;"></i>';
    if (s.includes('market')) return '<i data-lucide="trending-up" style="width:13px;height:13px;"></i>';
    return '<i data-lucide="globe" style="width:13px;height:13px;"></i>';
}

// Initialisation
document.addEventListener('DOMContentLoaded', function () {
    // Charger les nouvelles par défaut
    loadNewsGratuit('all');

    // Gérer les boutons de secteur
    const sectorButtons = document.querySelectorAll('.sector-btn');
    sectorButtons.forEach(button => {
        button.addEventListener('click', function () {
            sectorButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadNewsGratuit(this.getAttribute('data-sector'));
        });
    });

    // Bouton actualiser
    const refreshBtn = document.getElementById('refresh-ai-news');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function () {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.animation = 'spin 1s linear';
                setTimeout(() => icon.style.animation = '', 1000);
            }

            const activeSymbol = document.querySelector('.sector-btn.active');
            const activeSector = activeSymbol ? activeSymbol.getAttribute('data-sector') : 'all';
            loadNewsGratuit(activeSector);
        });
    }

    // Auto-refresh toutes les 15 minutes
    setInterval(() => {
        const activeSymbol = document.querySelector('.sector-btn.active');
        const activeSector = activeSymbol ? activeSymbol.getAttribute('data-sector') : 'all';
        loadNewsGratuit(activeSector);
    }, 15 * 60 * 1000);
});
