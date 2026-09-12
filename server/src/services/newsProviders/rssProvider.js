const axios = require('axios');
const BaseNewsProvider = require('./baseProvider');
const { normalizeArticle } = require('../../utils/normalizer');

const CATEGORY_IMAGES = {
  technology: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80'
  ],
  ai: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80'
  ],
  business: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80'
  ],
  startups: [
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80'
  ],
  science: [
    'https://images.unsplash.com/photo-1517976487502-869f697491cf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80'
  ],
  sports: [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80'
  ],
  health: [
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80'
  ],
  entertainment: [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'
  ],
  world: [
    'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
  ],
  politics: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80'
  ]
};

function getRandomImage(category, index = 0) {
  const list = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.technology;
  return list[index % list.length];
}

class RSSNewsProvider extends BaseNewsProvider {
  constructor() {
    super('LiveRSS');
  }

  parseRSS(xmlString, defaultCategory = 'general', defaultRegion = 'india') {
    const articles = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    let index = 0;

    while ((match = itemRegex.exec(xmlString)) !== null) {
      const itemContent = match[1];

      // Extract title
      const titleMatch = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(itemContent);
      let rawTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      // Clean source suffix
      let sourceName = 'Live Dispatch';
      if (rawTitle.includes(' - ')) {
        const parts = rawTitle.split(' - ');
        sourceName = parts.pop().trim();
        rawTitle = parts.join(' - ').trim();
      }

      // Extract link
      const linkMatch = /<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i.exec(itemContent);
      const articleUrl = linkMatch ? linkMatch[1].trim() : '#';

      // Extract pubDate safely
      const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(itemContent);
      let publishedAt = new Date().toISOString();
      if (pubDateMatch && pubDateMatch[1]) {
        try {
          const parsed = new Date(pubDateMatch[1].trim());
          if (!isNaN(parsed.getTime())) {
            publishedAt = parsed.toISOString();
          }
        } catch (err) {
          publishedAt = new Date().toISOString();
        }
      }

      // Extract description & sanitize HTML
      const descMatch = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i.exec(itemContent);
      let description = descMatch ? descMatch[1] : '';
      description = description
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!description || description.length < 25) {
        description = `${rawTitle}. Latest breaking report, background context, and verified analysis from ${sourceName}.`;
      }

      // Category detection
      let category = defaultCategory;
      if (defaultCategory === 'general' || defaultCategory === 'all') {
        const lower = `${rawTitle} ${description}`.toLowerCase();
        if (lower.includes('ai') || lower.includes('artificial intelligence') || lower.includes('chatgpt') || lower.includes('llm') || lower.includes('deepseek')) {
          category = 'ai';
        } else if (lower.includes('startup') || lower.includes('funding') || lower.includes('venture') || lower.includes('unicorn') || lower.includes('valuation')) {
          category = 'startups';
        } else if (lower.includes('cricket') || lower.includes('match') || lower.includes('tournament') || lower.includes('cup') || lower.includes('sports') || lower.includes('ipl')) {
          category = 'sports';
        } else if (lower.includes('isro') || lower.includes('space') || lower.includes('nasa') || lower.includes('science') || lower.includes('quantum') || lower.includes('telescope')) {
          category = 'science';
        } else if (lower.includes('market') || lower.includes('sensex') || lower.includes('nifty') || lower.includes('rbi') || lower.includes('economy') || lower.includes('shares') || lower.includes('rupee') || lower.includes('stock')) {
          category = 'business';
        } else if (lower.includes('movie') || lower.includes('film') || lower.includes('cinema') || lower.includes('actor') || lower.includes('box office') || lower.includes('ott')) {
          category = 'entertainment';
        } else if (lower.includes('health') || lower.includes('hospital') || lower.includes('vaccine') || lower.includes('pharma') || lower.includes('medical') || lower.includes('cancer')) {
          category = 'health';
        } else if (lower.includes('election') || lower.includes('minister') || lower.includes('parliament') || lower.includes('policy') || lower.includes('govt') || lower.includes('court')) {
          category = 'politics';
        } else if (lower.includes('war') || lower.includes('treaty') || lower.includes('summit') || lower.includes('china') || lower.includes('us') || lower.includes('uk') || lower.includes('russia')) {
          category = 'world';
        }
      }

      if (rawTitle && rawTitle.length > 5) {
        articles.push(
          normalizeArticle({
            title: rawTitle,
            description,
            articleUrl,
            sourceName,
            publishedAt,
            category,
            country: defaultRegion === 'india' ? 'in' : 'us',
            region: defaultRegion,
            imageUrl: getRandomImage(category, index)
          })
        );
        index++;
      }
    }

    return articles;
  }

  async getTopHeadlines(options = {}) {
    const region = options.region || 'india';
    const limit = parseInt(options.limit, 10) || 40;
    const page = parseInt(options.page, 10) || 1;

    const feeds = region === 'global'
      ? [
          'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en',
          'https://feeds.bbci.co.uk/news/world/rss.xml'
        ]
      : [
          'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',
          'https://feeds.feedburner.com/ndtvnews-top-stories'
        ];

    try {
      const responses = await Promise.allSettled(
        feeds.map(url => axios.get(url, { timeout: 3500, headers: { 'User-Agent': 'Mozilla/5.0' } }))
      );

      let allArticles = [];
      responses.forEach(res => {
        if (res.status === 'fulfilled' && res.value?.data) {
          const parsed = this.parseRSS(res.value.data, 'general', region);
          allArticles = [...allArticles, ...parsed];
        }
      });

      // Deduplicate by title
      const unique = [];
      const seen = new Set();
      for (const a of allArticles) {
        const key = a.title.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(a);
        }
      }

      const startIndex = (page - 1) * limit;
      const paginated = unique.slice(startIndex, startIndex + limit);

      return {
        provider: this.name,
        region,
        totalResults: unique.length,
        page,
        limit,
        articles: paginated
      };
    } catch (err) {
      console.warn(`[RSSProvider] Top headlines failed: ${err.message}`);
      return null;
    }
  }

  async getCategoryNews(category, options = {}) {
    const region = options.region || 'india';
    const limit = parseInt(options.limit, 10) || 40;
    const page = parseInt(options.page, 10) || 1;
    const cat = (category || 'technology').toLowerCase();

    const topicMap = {
      technology: 'TECHNOLOGY',
      ai: 'TECHNOLOGY',
      business: 'BUSINESS',
      startups: 'BUSINESS',
      science: 'SCIENCE',
      sports: 'SPORTS',
      entertainment: 'ENTERTAINMENT',
      world: 'WORLD',
      politics: 'NATION',
      health: 'HEALTH'
    };

    const topic = topicMap[cat] || 'TOP';
    const locale = region === 'global' ? 'hl=en-US&gl=US&ceid=US:en' : 'hl=en-IN&gl=IN&ceid=IN:en';

    const feedUrls = [];
    if (topic === 'TOP') {
      feedUrls.push(`https://news.google.com/rss?${locale}`);
    } else {
      feedUrls.push(`https://news.google.com/rss/headlines/section/topic/${topic}?${locale}`);
    }

    // Specific keyword search for sub-topics like AI or Startups to get hyper-relevant stories
    if (cat === 'ai') {
      feedUrls.push(`https://news.google.com/rss/search?q=artificial+intelligence+OR+LLM+OR+OpenAI&${locale}`);
    } else if (cat === 'startups') {
      feedUrls.push(`https://news.google.com/rss/search?q=startups+funding+valuation&${locale}`);
    } else if (cat === 'sports') {
      feedUrls.push(`https://news.google.com/rss/search?q=cricket+OR+athletics+OR+championship&${locale}`);
    }

    try {
      const responses = await Promise.allSettled(
        feedUrls.map(url => axios.get(url, { timeout: 3500, headers: { 'User-Agent': 'Mozilla/5.0' } }))
      );

      let allArticles = [];
      responses.forEach(res => {
        if (res.status === 'fulfilled' && res.value?.data) {
          const parsed = this.parseRSS(res.value.data, cat, region);
          allArticles = [...allArticles, ...parsed];
        }
      });

      // Force category tag so this category page has 100% focused stories
      const categorized = allArticles.map(a => ({ ...a, category: cat }));

      const unique = [];
      const seen = new Set();
      for (const a of categorized) {
        const key = a.title.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(a);
        }
      }

      const startIndex = (page - 1) * limit;
      const paginated = unique.slice(startIndex, startIndex + limit);

      return {
        provider: this.name,
        category: cat,
        region,
        totalResults: unique.length,
        page,
        limit,
        articles: paginated
      };
    } catch (err) {
      console.warn(`[RSSProvider] Error fetching category ${category}: ${err.message}`);
      return null;
    }
  }

  async searchNews(query, options = {}) {
    const region = options.region || 'all';
    const limit = parseInt(options.limit, 10) || 40;
    const page = parseInt(options.page, 10) || 1;
    const locale = region === 'global' ? 'hl=en-US&gl=US&ceid=US:en' : 'hl=en-IN&gl=IN&ceid=IN:en';
    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&${locale}`;

    try {
      const response = await axios.get(feedUrl, {
        timeout: 4000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const parsed = this.parseRSS(response.data, options.category || 'general', region);
      const startIndex = (page - 1) * limit;
      const paginated = parsed.slice(startIndex, startIndex + limit);

      return {
        provider: this.name,
        query,
        region,
        totalResults: parsed.length,
        page,
        limit,
        articles: paginated
      };
    } catch (err) {
      console.warn(`[RSSProvider] Error searching ${query}: ${err.message}`);
      return null;
    }
  }
}

module.exports = RSSNewsProvider;
