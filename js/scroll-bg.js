/**
 * Scroll-Reactive Background Gradient (Palette Pâle)
 * Transitions subtiles : blanc → gris bleuté → bleu très pâle → retour blanc
 * Donne un effet vivant au scroll sans casser le thème clair.
 */
(function () {
    'use strict';

    // Palette pâle — toutes les couleurs restent très claires
    var palette = [
        { r: 255, g: 255, b: 255 },   // 0%   — blanc pur
        { r: 243, g: 246, b: 250 },   // 15%  — gris bleuté très léger (#f3f6fa)
        { r: 232, g: 241, b: 248 },   // 30%  — bleu glacé (#e8f1f8)
        { r: 218, g: 238, b: 248 },   // 45%  — bleu ciel pâle (#daeef8)
        { r: 232, g: 241, b: 248 },   // 60%  — retour bleu glacé
        { r: 240, g: 245, b: 250 },   // 80%  — gris clair (#f0f5fa)
        { r: 255, g: 255, b: 255 }    // 100% — blanc pur
    ];

    var stops = [0, 0.15, 0.30, 0.45, 0.60, 0.80, 1.0];
    var ticking = false;

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function getColor(scrollPct) {
        var pct = Math.max(0, Math.min(1, scrollPct));

        for (var i = 0; i < stops.length - 1; i++) {
            if (pct >= stops[i] && pct <= stops[i + 1]) {
                var localT = (pct - stops[i]) / (stops[i + 1] - stops[i]);
                // Smoothstep easing for imperceptible transitions
                localT = localT * localT * (3 - 2 * localT);
                var c1 = palette[i];
                var c2 = palette[i + 1];
                return {
                    r: Math.round(lerp(c1.r, c2.r, localT)),
                    g: Math.round(lerp(c1.g, c2.g, localT)),
                    b: Math.round(lerp(c1.b, c2.b, localT))
                };
            }
        }
        return palette[0];
    }

    function update() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var scrollPct = docHeight > 0 ? scrollTop / docHeight : 0;

        var c = getColor(scrollPct);
        document.body.style.background =
            'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial paint
    update();
})();
