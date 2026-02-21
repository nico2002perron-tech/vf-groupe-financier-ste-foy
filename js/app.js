document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu ---
    const menuToggle = document.querySelector('.menu-toggle');
    const menuClose = document.querySelector('.menu-close');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-menu a');

    function openMenu() {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (menuToggle) menuToggle.addEventListener('click', openMenu);
    if (menuClose) menuClose.addEventListener('click', closeMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // --- Scroll Animations (Intersection Observer) ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-scroll');
    animatedElements.forEach(el => observer.observe(el));

    // --- Sticky Header Shadow ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 10) {
                navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
            } else {
                navbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
            }
        }
    });

    // --- Service Accordion Toggle (V3) with Image Swap ---
    const accordionItems = document.querySelectorAll('.accordion-item');
    const featuredImage = document.getElementById('services-featured-img');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            accordionItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            item.classList.toggle('active');

            if (item.classList.contains('active') && featuredImage) {
                const newImageSrc = item.dataset.image;
                if (newImageSrc) {
                    featuredImage.style.opacity = '0';
                    setTimeout(() => {
                        featuredImage.src = newImageSrc;
                        featuredImage.style.opacity = '1';
                    }, 200);
                }
            }
        });
    });

    // --- Economic Cycle Interaction V2 (Ultra Modern) ---
    const radarQuadrants = document.querySelectorAll('.radar-quadrant');
    const cycleTitle = document.getElementById('cycle-title');
    const cycleDesc = document.getElementById('cycle-desc');

    const cycleData = {
        expansion: {
            title: "Expansion",
            desc: "Positionnement équilibré. Nous profitons de la croissance des marchés tout en surveillant les indicateurs d'inflation."
        },
        surchauffe: {
            title: "Surchauffe",
            desc: "Gestion du risque accrue. Réduction de l'exposition aux actifs volatils et prise de profits stratégique."
        },
        recession: {
            title: "Récession",
            desc: "Protection du capital. Focus sur les valeurs refuges et les obligations de qualité pour préserver votre patrimoine."
        },
        reprise: {
            title: "Reprise",
            desc: "Opportunités ciblées. Identification des secteurs (Tech, Indus) à fort potentiel de rebond pour maximiser la performance future."
        }
    };

    radarQuadrants.forEach(quadrant => {
        quadrant.addEventListener('click', () => {
            radarQuadrants.forEach(q => q.classList.remove('active'));
            quadrant.classList.add('active');

            const phase = quadrant.getAttribute('data-phase');
            if (cycleData[phase] && cycleTitle && cycleDesc) {
                cycleTitle.textContent = cycleData[phase].title;
                cycleDesc.textContent = cycleData[phase].desc;
                cycleTitle.className = `text-gradient-${phase}`;
            }
        });
    });

    // --- Live Markets Charts (Chart.js) ---
    function initMarketCharts() {
        const ctxSP500 = document.getElementById('chartSP500');
        const ctxNASDAQ = document.getElementById('chartNASDAQ');
        const ctxDOW = document.getElementById('chartDOW');

        if (!ctxSP500) return;

        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
            elements: { line: { tension: 0.4 }, point: { radius: 0 } }
        };

        const createChart = (ctx, color, data) => {
            return new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array(data.length).fill(''),
                    datasets: [{
                        data: data,
                        borderColor: color,
                        borderWidth: 2,
                        fill: true,
                        backgroundColor: color + '22'
                    }]
                },
                options: commonOptions
            });
        };

        // Simulated real-time data
        createChart(ctxSP500, '#00b4d8', [5800, 5820, 5815, 5840, 5830, 5860, 5892]);
        createChart(ctxNASDAQ, '#00b4d8', [18200, 18300, 18250, 18400, 18500, 18600, 18700]);
        createChart(ctxDOW, '#00b4d8', [42000, 42100, 42050, 42200, 42150, 42300, 42400]);
    }

    initMarketCharts();

    // Re-run icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// --- Team Carousel Logic (Continuous Marquee) ---
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('team-track');
    const prevBtn = document.getElementById('team-prev');
    const nextBtn = document.getElementById('team-next');

    if (!track) return;

    const originalCards = Array.from(track.children);
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.classList.add('clone');
        track.appendChild(clone);
    });

    let currentX = 0;
    let speed = 0.4;
    let isPaused = false;
    let totalOriginalWidth = 0;

    function calculateDimensions() {
        if (originalCards.length > 0) {
            const firstCard = originalCards[0];
            const cardWidth = firstCard.offsetWidth;
            const style = window.getComputedStyle(track);
            const gap = parseFloat(style.gap) || 20;
            totalOriginalWidth = (cardWidth + gap) * originalCards.length;
        }
    }

    function animate() {
        if (!isPaused) {
            currentX += speed;
            if (currentX >= totalOriginalWidth) {
                currentX = 0;
            }
            track.style.transform = `translateX(-${currentX}px)`;
        }
        requestAnimationFrame(animate);
    }

    setTimeout(() => {
        calculateDimensions();
        animate();
    }, 500);

    window.addEventListener('resize', calculateDimensions);

    const wrapper = document.querySelector('.team-carousel-wrapper');
    if (wrapper) {
        wrapper.addEventListener('mouseenter', () => isPaused = true);
        wrapper.addEventListener('mouseleave', () => isPaused = false);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const cardWidth = (originalCards[0]?.offsetWidth || 300) + 20;
            currentX += cardWidth;
            if (currentX >= totalOriginalWidth) currentX -= totalOriginalWidth;
            track.style.transform = `translateX(-${currentX}px)`;
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const cardWidth = (originalCards[0]?.offsetWidth || 300) + 20;
            currentX -= cardWidth;
            if (currentX < 0) currentX += totalOriginalWidth;
            track.style.transform = `translateX(-${currentX}px)`;
        });
    }
});
