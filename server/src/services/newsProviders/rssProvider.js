const axios = require('axios');
const BaseNewsProvider = require('./baseProvider');
const { normalizeArticle } = require('../../utils/normalizer');

// Curated stock category photos for fallback article images
const CATEGORY_IMAGES = {
  technology: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80'
  ],
  ai: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80'
  ],
  business: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80'
  ],
  startups: [
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80'
  ],
  science: [
    'https://images.unsplash.com/photo-1517976487502-869f697491cf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80'
  ],
  sports: [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80'
  ],
  health: [
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80'
  ],
  entertainment: [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80'
  ],
  world: [
    'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
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

  // Parse standard RSS XML into array of article objects
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

      // Clean source suffix (e.g. "Title - The Hindu" or "Title - NDTV")
      let sourceName = 'Live Dispatch';
      if (rawTitle.includes(' - ')) {
        const parts = rawTitle.split(' - ');
        sourceName = parts.pop().trim();
        rawTitle = parts.join(' - ').trim();
      }

      // Extract link
      const linkMatch = /<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i.exec(itemContent);
      const articleUrl = linkMatch ? linkMatch[1].trim() : '#';

      // Extract pubDate
      const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(itemContent);
      const publishedAt = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

      // Extract description
      const descMatch = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i.exec(itemContent);
      let description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() : '';
      if (!description || description.length < 20) {
        description = `Latest breaking report and editorial analysis from ${sourceName}.`;
      }

      // Auto-detect category from text
      let category = defaultCategory;
      const lower = `${rawTitle} ${description}`.toLowerCase();
      if (lower.includes('ai') || lower.includes('artificial intelligence') || lower.includes('chatgpt') || lower.includes('llm')) {
        category = 'ai';
      } else if (lower.includes('startup') || lower.includes('funding') || lower.includes('venture') || lower.includes('unicorn')) {
        category = 'startups';
      } else if (lower.includes('cricket') || lower.includes('match') || lower.includes('tournament') || lower.includes('cup') || lower.includes('sports')) {
        category = 'sports';
      } else if (lower.includes('isro') || lower.includes('space') || lower.includes('nasa') || lower.includes('science') || lower.includes('quantum')) {
        category = 'science';
      } else if (lower.includes('market') || lower.includes('sensex') || lower.includes('nifty') || lower.includes('rbi') || lower.includes('economy') || lower.includes('shares') || lower.includes('rupee')) {
        category = 'business';
      } else if (lower.includes('movie') || lower.includes('film') || lower.includes('cinema') || lower.includes('actor') || lower.includes('box office')) {
        category = 'entertainment';
      } else if (lower.includes('election') || lower.includes('minister') || lower.includes('parliament') || lower.includes('policy') || lower.includes('govt')) {
        category = 'politics';
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
    const limit = parseInt(options.limit, 10) || 30;
    const page = parseInt(options.page, 10) || 1;

    let feedUrl = region === 'global'
      ? 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en'
      : 'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en';

    try {
      const response = await axios.get(feedUrl, {
        timeout: 4000,
        headers: { 'User-Agent': 'Mozilla/5.0 (NewsHub Aggregator)' }
      });

      const parsed = this.parseRSS(response.data, 'general', region);
      const startIndex = (page - 1) * limit;
      const paginated = parsed.slice(startIndex, startIndex + limit);

      return {
        provider: this.name,
        region,
        totalResults: parsed.length,
        page,
        limit,
        articles: paginated
      };
    } catch (err) {
      console.warn(`[RSSProvider] Error fetching top headlines: ${err.message}`);
      return null;
    }
  }

  async getCategoryNews(category, options = {}) {
    const region = options.region || 'india';
    const limit = parseInt(options.limit, 10) || 30;
    const page = parseInt(options.page, 10) || 1;

    const topicMap = {
      technology: 'TECHNOLOGY',
      ai: 'TECHNOLOGY',
      business: 'BUSINESS',
      startups: 'BUSINESS',
      science: 'SCIENCE',
      sports: 'SPORTS',
      entertainment: 'ENTERTAINMENT',
      world: 'WORLD',
      politics: 'NATION'
    };

    const topic = topicMap[category.toLowerCase()] || 'TOP';
    const locale = region === 'global' ? 'hl=en-US&gl=US&ceid=US:en' : 'hl=en-IN&gl=IN&ceid=IN:en';
    const feedUrl = topic === 'TOP'
      ? `https://news.google.com/rss?${locale}`
      : `https://news.google.com/rss/headlines/section/topic/${topic}?${locale}`;

    try {
      const response = await axios.get(feedUrl, {
        timeout: 4000,
        headers: { 'User-Agent': 'Mozilla/5.0 (NewsHub Aggregator)' }
      });

      const parsed = this.parseRSS(response.data, category.toLowerCase(), region);
      const forcedCategory = parsed.map(a => ({ ...a, category: category.toLowerCase() }));
      const startIndex = (page - 1) * limit;
      const paginated = forcedCategory.slice(startIndex, startIndex + limit);

      return {
        provider: this.name,
        category: category.toLowerCase(),
        region,
        totalResults: forcedCategory.length,
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
    const region = options.region || 'india';
    const limit = parseInt(options.limit, 10) || 30;
    const page = parseInt(options.page, 10) || 1;
    const locale = region === 'global' ? 'hl=en-US&gl=US&ceid=US:en' : 'hl=en-IN&gl=IN&ceid=IN:en';
    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&${locale}`;

    try {
      const response = await axios.get(feedUrl, {
        timeout: 4000,
        headers: { 'User-Agent': 'Mozilla/5.0 (NewsHub Aggregator)' }
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
