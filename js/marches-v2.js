/* =========================================
   MARCHÉS V2 — TradingView + Market Status
   + Dynamic Holdings via /api/market-holdings
   ========================================= */

(function () {
    'use strict';

    // ── TradingView Charts ──
    var CHARTS = [
        { containerId: 'tv-tsx', symbol: 'TSX:TXCX', name: 'S&P/TSX' },
        { containerId: 'tv-spx', symbol: 'FOREXCOM:SPXUSD', name: 'S&P 500' },
        { containerId: 'tv-ndx', symbol: 'NASDAQ:NDX', name: 'NASDAQ 100' },
        { containerId: 'tv-dji', symbol: 'DJ:DJI', name: 'Dow Jones' },
        { containerId: 'tv-gold', symbol: 'TVC:GOLD', name: 'Or' },
        { containerId: 'tv-oil', symbol: 'TVC:USOIL', name: 'Pétrole WTI' }
    ];

    // ── Symbol to API key mapping ──
    var SYMBOL_MAP = {
        'TSX': 'tsx',
        'SPX': 'spx',
        'NDX': 'ndx',
        'DJI': 'dji',
        'GOLD': 'gold',
        'OIL': 'oil'
    };

    function initTradingViewCharts() {
        CHARTS.forEach(function (chart) {
            var container = document.getElementById(chart.containerId);
            if (!container) return;

            container.innerHTML = '';

            var widgetDiv = document.createElement('div');
            widgetDiv.className = 'tradingview-widget-container__widget';
            widgetDiv.style.width = '100%';
            widgetDiv.style.height = '100%';
            container.appendChild(widgetDiv);

            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
            script.async = true;
            script.textContent = JSON.stringify({
                symbol: chart.symbol,
                width: '100%',
                height: '100%',
                locale: 'fr',
                dateRange: '3M',
                colorTheme: 'light',
                isTransparent: true,
                autosize: true,
                largeChartUrl: '',
                noTimeScale: false,
                chartOnly: false
            });

            container.appendChild(script);
        });
    }

    // ── Market Status ──
    function updateMarketStatus() {
        var statusText = document.getElementById('market-status-text');
        var statusDot = document.querySelector('.status-dot');
        if (!statusText || !statusDot) return;

        var now = new Date();
        var est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        var day = est.getDay();
        var hours = est.getHours();
        var minutes = est.getMinutes();
        var time = hours + minutes / 60;

        var isWeekday = day >= 1 && day <= 5;
        var isMarketHours = time >= 9.5 && time < 16;
        var isPreMarket = time >= 4 && time < 9.5;
        var isAfterHours = time >= 16 && time < 20;

        if (isWeekday && isMarketHours) {
            statusText.textContent = 'Marchés ouverts';
            statusDot.className = 'status-dot status-open';
        } else if (isWeekday && isPreMarket) {
            statusText.textContent = 'Pré-marché';
            statusDot.className = 'status-dot status-open';
        } else if (isWeekday && isAfterHours) {
            statusText.textContent = 'Après-bourse';
            statusDot.className = 'status-dot status-closed';
        } else {
            statusText.textContent = 'Marchés fermés';
            statusDot.className = 'status-dot status-closed';
        }
    }

    // ── Dynamic Holdings from API ──
    function loadHoldings() {
        fetch('/api/market-holdings')
            .then(function (res) { return res.json(); })
            .then(function (result) {
                if (!result.success || !result.data || !result.data.indices) return;

                var indices = result.data.indices;
                var lastUpdate = result.data.lastUpdate || '';

                // Update each card
                var cards = document.querySelectorAll('.market-edu-card');
                cards.forEach(function (card) {
                    var symbol = card.getAttribute('data-symbol');
                    var key = SYMBOL_MAP[symbol];
                    if (!key || !indices[key]) return;

                    var data = indices[key];

                    // Update holdings chips
                    var holdingsContainer = card.querySelector('.holdings-chips');
                    if (holdingsContainer && data.holdings && data.holdings.length > 0) {
                        holdingsContainer.innerHTML = data.holdings.map(function (h) {
                            return '<span class="holding-chip">' + escapeHtml(h) + '</span>';
                        }).join('');
                    }

                    // Update sector chips
                    var sectorsContainer = card.querySelector('.mcard-sectors');
                    if (sectorsContainer && data.sectors && data.sectors.length > 0) {
                        sectorsContainer.innerHTML = data.sectors.map(function (s, i) {
                            var sectorKey = data.sectorKeys && data.sectorKeys[i] ? data.sectorKeys[i] : 'tech';
                            return '<span class="sector-chip sector-' + escapeHtml(sectorKey) + '">' + escapeHtml(s) + '</span>';
                        }).join('');
                    }

                    // Update source with date
                    var sourceEl = card.querySelector('.mcard-source');
                    if (sourceEl && lastUpdate) {
                        var currentSource = sourceEl.textContent;
                        sourceEl.textContent = currentSource + ' · Màj ' + lastUpdate;
                    }
                });

                console.log('✅ Holdings chargés (' + result.source + ')');
            })
            .catch(function (err) {
                console.log('ℹ️ Holdings: utilisation des données par défaut', err.message);
            });
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ── Init ──
    document.addEventListener('DOMContentLoaded', function () {
        initTradingViewCharts();
        updateMarketStatus();
        setInterval(updateMarketStatus, 60000);

        // Load dynamic holdings (avec délai pour pas bloquer le rendu)
        setTimeout(loadHoldings, 2000);
    });
})();
