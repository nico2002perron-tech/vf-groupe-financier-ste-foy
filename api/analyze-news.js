const https = require('https');

// ALL RSS feeds — on fetche tout pour avoir un gros bassin d'articles
const ALL_FEEDS = [
    'https://ici.radio-canada.ca/rss/4159',          // Radio-Canada Économie
    'https://ici.radio-canada.ca/rss/4169',          // Radio-Canada Science/Tech
    'https://www.lapresse.ca/affaires/rss',           // La Presse Affaires
    'https://www.lesaffaires.com/rss',                // Les Affaires
];

// Secteurs valides (correspondent aux onglets du frontend)
const VALID_SECTORS = ['all', 'health', 'tech', 'crypto', 'industrial', 'energy', 'finance', 'defensive'];

const SECTOR_LABELS = {
    all: 'tous les secteurs',
    health: 'santé',
    tech: 'technologie',
    crypto: 'cryptomonnaies',
    industrial: 'industriel',
    energy: 'énergie',
    finance: 'finance',
    defensive: 'défensif'
};

// Max age = 2 jours (en ms)
const MAX_AGE_MS = 2 * 24 * 60 * 60 * 1000;

// ── Fetch URL ──
function fetchURL(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : require('http');
        const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 GFSF-Radar/1.0' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchURL(res.headers.location).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

// ── Parse RSS XML (no dependencies) ──
function parseRSS(xml) {
    const articles = [];
    const items = xml.split('<item>').slice(1);

    for (const item of items.slice(0, 20)) {
        const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]>/s) || [])[1] ||
                      (item.match(/<title>(.*?)<\/title>/s) || [])[1] || '';
        const link = (item.match(/<link>(.*?)<\/link>/) || [])[1] || '';
        const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
        const desc = (item.match(/<description><!\[CDATA\[(.*?)\]\]>/s) || [])[1] ||
                     (item.match(/<description>(.*?)<\/description>/s) || [])[1] || '';

        const cleanTitle = title.replace(/<[^>]+>/g, '').trim();
        if (cleanTitle && cleanTitle.length > 10) {
            articles.push({
                title: cleanTitle,
                link: link.trim(),
                pubDate: pubDate.trim(),
                description: desc.replace(/<[^>]+>/g, '').substring(0, 400).trim()
            });
        }
    }
    return articles;
}

// ── Helpers ──
function getTimeAgo(pubDate) {
    if (!pubDate) return '??';
    try {
        const diffMins = Math.floor((Date.now() - new Date(pubDate).getTime()) / 60000);
        if (diffMins < 0) return '1min';
        if (diffMins < 60) return `${diffMins}min`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
        return `${Math.floor(diffMins / 1440)}j`;
    } catch { return '??'; }
}

function getSourceName(link) {
    if (!link) return 'Actualités';
    if (link.includes('radio-canada')) return 'Radio-Canada';
    if (link.includes('lapresse')) return 'La Presse';
    if (link.includes('lesaffaires')) return 'Les Affaires';
    if (link.includes('ledevoir')) return 'Le Devoir';
    return 'Actualités';
}

function isWithin2Days(pubDate) {
    if (!pubDate) return true; // keep if no date
    try {
        return (Date.now() - new Date(pubDate).getTime()) <= MAX_AGE_MS;
    } catch { return true; }
}

// ── Groq API : Classify + Summarize ──
async function classifyAndSummarize(articles) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error('GROQ_API_KEY not set');
        return null;
    }

    const articlesList = articles.map((a, i) =>
        `${i + 1}. "${a.title}" — ${a.description || ''}`
    ).join('\n');

    const prompt = `Tu es un analyste financier expert québécois.

TÂCHE : Pour chaque article ci-dessous, tu dois :
1. Le CLASSER dans UN secteur parmi : health, tech, crypto, industrial, energy, finance, defensive
2. Écrire un RÉSUMÉ analytique de 1-2 phrases en français (impact pour investisseurs québécois)

RÈGLES DE CLASSIFICATION :
- "health" : pharmaceutique, hôpitaux, biotechnologie, soins de santé, médicaments, CHSLD, système de santé
- "tech" : technologie, IA, logiciels, semi-conducteurs, télécommunications, startups tech, données, cybersécurité
- "crypto" : bitcoin, ethereum, blockchain, cryptomonnaies, Web3, NFT, DeFi
- "industrial" : manufacturier, construction, transport, infrastructure, aérospatiale, mines, automobile
- "energy" : pétrole, gaz, hydro-électricité, énergie renouvelable, solaire, éolien, nucléaire
- "finance" : banques, assurances, marchés boursiers, taux d'intérêt, Banque du Canada, REER, CELI, fonds, investissement, rendement, bénéfice
- "defensive" : alimentation, services publics, immobilier, consommation de base, télécoms traditionnelles, détaillants essentiels

Si un article touche plusieurs secteurs, choisis le PLUS pertinent.

Articles :
${articlesList}

Réponds UNIQUEMENT en JSON valide : un tableau d'objets avec "index" (numéro), "sector" (un des 7 secteurs), "summary" (analyse en français).
Exemple : [{"index":1,"sector":"finance","summary":"..."}]`;

    const body = JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 3000
    });

    const data = await new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': Buffer.byteLength(body)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch { reject(new Error('Invalid Groq response')); }
            });
        });
        req.on('error', reject);
        req.setTimeout(25000, () => { req.destroy(); reject(new Error('Groq timeout')); });
        req.write(body);
        req.end();
    });

    if (data.error) {
        console.error('Groq API error:', data.error);
        return null;
    }

    const content = data.choices?.[0]?.message?.content || '';
    try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error('Failed to parse Groq response:', e.message);
    }
    return null;
}

// ── Main Handler ──
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const sector = req.body?.sector || 'all';

    try {
        // 1. Fetch TOUS les feeds RSS en parallèle
        const feedResults = await Promise.all(
            ALL_FEEDS.map(url =>
                fetchURL(url).catch(err => {
                    console.error(`RSS failed: ${url}`, err.message);
                    return '';
                })
            )
        );

        // 2. Parser tous les articles
        let allArticles = [];
        feedResults.forEach(xml => {
            if (xml) allArticles = allArticles.concat(parseRSS(xml));
        });

        // 3. Filtrer : max 2 jours, dédupliquer, trier par date
        allArticles = allArticles.filter(a => isWithin2Days(a.pubDate));
        allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        const seen = new Set();
        allArticles = allArticles.filter(a => {
            const key = a.title.toLowerCase().substring(0, 50);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Garder un bon bassin (max 25 articles à classifier)
        allArticles = allArticles.slice(0, 25);

        if (allArticles.length === 0) {
            return res.status(200).json({
                success: false,
                articles: [],
                debug: { articlesReceived: 0, aiCalled: false, groqKey: process.env.GROQ_API_KEY ? '***set***' : 'MISSING' }
            });
        }

        // 4. Envoyer à Groq pour classification + résumé
        const aiResults = await classifyAndSummarize(allArticles);

        // 5. Construire le map classifié
        const classified = {}; // { sector: [ {article, summary} ] }
        VALID_SECTORS.forEach(s => { if (s !== 'all') classified[s] = []; });

        if (aiResults) {
            aiResults.forEach(result => {
                const idx = result.index - 1;
                const article = allArticles[idx];
                if (!article) return;

                const sec = VALID_SECTORS.includes(result.sector) && result.sector !== 'all'
                    ? result.sector : 'finance'; // fallback

                classified[sec].push({
                    title: article.title,
                    summary: result.summary || article.description || 'Analyse en cours...',
                    source: getSourceName(article.link),
                    time: getTimeAgo(article.pubDate),
                    link: article.link,
                    sector: sec,
                    isNew: getTimeAgo(article.pubDate).includes('min') ||
                           (getTimeAgo(article.pubDate).includes('h') && parseInt(getTimeAgo(article.pubDate)) < 3)
                });
            });
        } else {
            // Fallback si Groq échoue : mettre tous dans finance
            allArticles.slice(0, 8).forEach(article => {
                classified['finance'].push({
                    title: article.title,
                    summary: article.description || 'Analyse indisponible.',
                    source: getSourceName(article.link),
                    time: getTimeAgo(article.pubDate),
                    link: article.link,
                    sector: 'finance',
                    isNew: false
                });
            });
        }

        // 6. Garantir minimum 3 articles par secteur
        //    Si un secteur en a moins de 3, on prend des articles des plus gros secteurs
        const allClassified = [];
        Object.values(classified).forEach(arr => allClassified.push(...arr));
        allClassified.sort((a, b) => {
            const ta = a.time, tb = b.time;
            return 0; // keep original order
        });

        for (const sec of Object.keys(classified)) {
            while (classified[sec].length < 3 && allClassified.length > 0) {
                // Trouver un article d'un secteur qui en a > 3, ou réutiliser le plus récent
                let donor = null;
                for (const otherSec of Object.keys(classified)) {
                    if (otherSec !== sec && classified[otherSec].length > 3) {
                        donor = classified[otherSec].pop();
                        break;
                    }
                }
                if (!donor) {
                    // Dupliquer depuis le pool global (les plus récents)
                    donor = { ...allClassified[classified[sec].length % allClassified.length] };
                }
                donor = { ...donor, sector: sec };
                classified[sec].push(donor);
            }
        }

        // 7. Retourner selon le secteur demandé
        let responseArticles;
        if (sector === 'all') {
            // Pour "all" : prendre les plus récents de tous les secteurs, max 8
            responseArticles = allClassified.slice(0, 8);
        } else {
            responseArticles = classified[sector] || [];
        }

        // Toujours au moins 3
        responseArticles = responseArticles.slice(0, 8);

        return res.status(200).json({
            success: true,
            articles: responseArticles,
            debug: {
                groqKey: process.env.GROQ_API_KEY ? '***set***' : 'MISSING',
                articlesReceived: allArticles.length,
                aiCalled: !!aiResults,
                sectorsCount: Object.fromEntries(Object.entries(classified).map(([k, v]) => [k, v.length]))
            }
        });

    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};
