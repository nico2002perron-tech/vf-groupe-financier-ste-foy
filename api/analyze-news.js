const https = require('https');

// RSS feeds par secteur
const RSS_FEEDS = {
    all: [
        'https://ici.radio-canada.ca/rss/4159',          // Radio-Canada Économie
        'https://www.lesaffaires.com/rss',                // Les Affaires
        'https://www.lapresse.ca/affaires/rss',           // La Presse Affaires
    ],
    tech: [
        'https://ici.radio-canada.ca/rss/4169',          // Radio-Canada Science/Tech
    ],
    health: [
        'https://ici.radio-canada.ca/rss/4159',
    ],
    crypto: [
        'https://www.lesaffaires.com/rss',
    ],
    industrial: [
        'https://www.lesaffaires.com/rss',
    ],
    energy: [
        'https://www.lesaffaires.com/rss',
    ],
    finance: [
        'https://www.lesaffaires.com/rss',
        'https://www.lapresse.ca/affaires/rss',
    ],
    defensive: [
        'https://ici.radio-canada.ca/rss/4159',
    ]
};

// Fetch URL content via https
function fetchURL(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : require('http');
        const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 GFSF-Radar/1.0' } }, (res) => {
            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchURL(res.headers.location).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.setTimeout(8000, () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

// Parse RSS XML simply (no dependency needed)
function parseRSS(xml) {
    const articles = [];
    const items = xml.split('<item>').slice(1);

    for (const item of items.slice(0, 10)) {
        const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/) || [])[1] ||
                      (item.match(/<title>(.*?)<\/title>/) || [])[1] || '';
        const link = (item.match(/<link>(.*?)<\/link>/) || [])[1] || '';
        const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
        const desc = (item.match(/<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/) || [])[1] ||
                     (item.match(/<description>(.*?)<\/description>/) || [])[1] || '';

        if (title && title.length > 10) {
            articles.push({
                title: title.replace(/<[^>]+>/g, '').trim(),
                link: link.trim(),
                pubDate: pubDate.trim(),
                description: desc.replace(/<[^>]+>/g, '').substring(0, 300).trim()
            });
        }
    }
    return articles;
}

// Get time ago string
function getTimeAgo(pubDate) {
    if (!pubDate) return '??';
    try {
        const diffMins = Math.floor((Date.now() - new Date(pubDate).getTime()) / 60000);
        if (diffMins < 0) return '1min';
        if (diffMins < 60) return `${diffMins}min`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
        return `${Math.floor(diffMins / 1440)}j`;
    } catch {
        return '??';
    }
}

// Detect source name from URL
function getSourceName(link) {
    if (!link) return 'Actualités';
    if (link.includes('radio-canada')) return 'Radio-Canada';
    if (link.includes('lapresse')) return 'La Presse';
    if (link.includes('lesaffaires')) return 'Les Affaires';
    if (link.includes('ledevoir')) return 'Le Devoir';
    return 'Actualités';
}

// Call Groq API to analyze articles
async function analyzeWithGroq(articles, sector) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error('GROQ_API_KEY not set');
        return null;
    }

    const sectorNames = {
        all: 'tous les secteurs financiers',
        health: 'le secteur de la santé',
        tech: 'le secteur technologique',
        crypto: 'les cryptomonnaies',
        industrial: 'le secteur industriel',
        energy: 'le secteur de l\'énergie',
        finance: 'le secteur financier',
        defensive: 'les secteurs défensifs'
    };

    const articlesList = articles.slice(0, 8).map((a, i) =>
        `${i + 1}. "${a.title}" — ${a.description || 'Pas de description'}`
    ).join('\n');

    const prompt = `Tu es un analyste financier expert. Analyse ces actualités pour ${sectorNames[sector] || 'les marchés'}.

Pour chaque article, donne un résumé de 1-2 phrases en français qui explique l'impact potentiel sur les investisseurs québécois.

Articles :
${articlesList}

Réponds UNIQUEMENT en JSON valide, un tableau d'objets avec les champs "index" (numéro de l'article) et "summary" (ton analyse en français).
Exemple : [{"index":1,"summary":"Résumé ici..."}]`;

    const body = JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500
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
                try {
                    resolve(JSON.parse(data));
                } catch {
                    reject(new Error('Invalid Groq response'));
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(15000, () => { req.destroy(); reject(new Error('Groq timeout')); });
        req.write(body);
        req.end();
    });

    if (data.error) {
        console.error('Groq API error:', data.error);
        return null;
    }

    const content = data.choices?.[0]?.message?.content || '';
    try {
        // Extract JSON from response (might be wrapped in markdown)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error('Failed to parse Groq response:', e.message);
    }
    return null;
}

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sector = req.body?.sector || 'all';
    const feeds = RSS_FEEDS[sector] || RSS_FEEDS.all;

    try {
        // 1. Fetch all RSS feeds in parallel
        const feedPromises = feeds.map(url =>
            fetchURL(url).catch(err => {
                console.error(`RSS fetch failed for ${url}:`, err.message);
                return '';
            })
        );
        const feedResults = await Promise.all(feedPromises);

        // 2. Parse articles
        let allArticles = [];
        feedResults.forEach(xml => {
            if (xml) {
                allArticles = allArticles.concat(parseRSS(xml));
            }
        });

        // Sort by date (newest first) and dedupe by title
        allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        const seen = new Set();
        allArticles = allArticles.filter(a => {
            const key = a.title.toLowerCase().substring(0, 50);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        const topArticles = allArticles.slice(0, 8);

        if (topArticles.length === 0) {
            return res.status(200).json({
                success: false,
                articles: [],
                debug: { articlesReceived: 0, aiCalled: false, groqKey: '***configured***' }
            });
        }

        // 3. Analyze with Groq AI
        const analyses = await analyzeWithGroq(topArticles, sector);

        // 4. Build response
        const articles = topArticles.map((article, i) => {
            const aiSummary = analyses?.find(a => a.index === i + 1);
            return {
                title: article.title,
                summary: aiSummary?.summary || article.description || 'Analyse en cours...',
                source: getSourceName(article.link),
                time: getTimeAgo(article.pubDate),
                link: article.link,
                isNew: getTimeAgo(article.pubDate).includes('min') ||
                       (getTimeAgo(article.pubDate).includes('h') && parseInt(getTimeAgo(article.pubDate)) < 3)
            };
        });

        return res.status(200).json({
            success: true,
            articles,
            debug: {
                groqKey: process.env.GROQ_API_KEY ? '***configured***' : 'MISSING',
                articlesReceived: topArticles.length,
                aiCalled: !!analyses
            }
        });

    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
