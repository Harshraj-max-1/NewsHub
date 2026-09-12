const axios = require('axios');
const BaseNewsProvider = require('./baseProvider');
const { normalizeArticle } = require('../../utils/normalizer');

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
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
  ],
  sports: [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80'
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

  parseRSS(xmlString, defaultCategory = 'general', defaultRegion = 'india', language = 'en') {
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
      let sourceName = language === 'hi' ? 'दैनिक समाचार' : 'Live Dispatch';
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
      let publishedAt = new Date().toISOString();
      if (pubDateMatch && pubDateMatch[1]) {
        try {
          const parsed = new Date(pubDateMatch[1].trim());
          if (!isNaN(parsed.getTime())) {
            publishedAt = parsed.toISOString();
          }
        } catch (err) {}
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
        description = language === 'hi'
          ? `${rawTitle} — ${sourceName} से संपूर्ण और निष्पक्ष समाचार रिपोर्ट।`
          : `${rawTitle}. Latest breaking report, background context, and verified analysis from ${sourceName}.`;
      }

      // Category detection
      let category = defaultCategory;
      if (defaultCategory === 'general' || defaultCategory === 'all') {
        const lower = `${rawTitle} ${description}`.toLowerCase();
        if (lower.includes('ai') || lower.includes('तकनीक') || lower.includes('tech') || lower.includes('chatgpt') || lower.includes('मोबाइल') || lower.includes('smartphone')) {
          category = 'technology';
        } else if (lower.includes('स्टार्टअप') || lower.includes('startup') || lower.includes('फंडिंग')) {
          category = 'startups';
        } else if (lower.includes('क्रिकेट') || lower.includes('cricket') || lower.includes('खेल') || lower.includes('match') || lower.includes('ipl')) {
          category = 'sports';
        } else if (lower.includes('isro') || lower.includes('इसरो') || lower.includes('अंतरिक्ष') || lower.includes('science') || lower.includes('विज्ञान')) {
          category = 'science';
        } else if (lower.includes('बाजार') || lower.includes('शेयर') || lower.includes('सेंसेक्स') || lower.includes('निफ्टी') || lower.includes('business') || lower.includes('रुपया') || lower.includes('सोना')) {
          category = 'business';
        } else if (lower.includes('फिल्म') || lower.includes('सिनेमा') || lower.includes('बॉलीवुड') || lower.includes('movie') || lower.includes('actor') || lower.includes('मनोरंजन')) {
          category = 'entertainment';
        } else if (lower.includes('स्वास्थ्य') || lower.includes('बीमारी') || lower.includes('दवा') || lower.includes('health') || lower.includes('डॉक्टर')) {
          category = 'health';
        } else if (lower.includes('चुनाव') || lower.includes('सरकार') || lower.includes('राजनीति') || lower.includes('मंत्री') || lower.includes('संसद') || lower.includes('politics')) {
          category = 'politics';
        } else if (lower.includes('विदेश') || lower.includes('अमेरिका') || lower.includes('चीन') || lower.includes('रूस') || lower.includes('दुनिया') || lower.includes('world') || lower.includes('global')) {
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
            country: defaultRegion === 'global' ? 'us' : 'in',
            region: defaultRegion,
            language: language || 'en',
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
    const language = options.lang || (region === 'hindi' ? 'hi' : 'en');
    const limit = parseInt(options.limit, 10) || 40;
    const page = parseInt(options.page, 10) || 1;

    let feeds = [];
    if (language === 'hi' || region === 'hindi') {
      feeds = [
        'https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi',
        'https://feeds.feedburner.com/ndtvkhabar',
        'https://feeds.bbci.co.uk/hindi/rss.xml'
      ];
    } else if (region === 'global') {
      feeds = [
        'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en',
        'https://feeds.bbci.co.uk/news/world/rss.xml'
      ];
    } else {
      feeds = [
        'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',
        'https://feeds.feedburner.com/ndtvnews-top-stories'
      ];
    }

    try {
      const responses = await Promise.allSettled(
        feeds.map(url => axios.get(url, { timeout: 3500, headers: { 'User-Agent': 'Mozilla/5.0' } }))
      );

      let allArticles = [];
      responses.forEach(res => {
        if (res.status === 'fulfilled' && res.value?.data) {
          const parsed = this.parseRSS(res.value.data, 'general', region === 'hindi' ? 'india' : region, language);
          allArticles = [...allArticles, ...parsed];
        }
      });

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
        language,
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

  async getHindiNews(scope = 'all', options = {}) {
    const limit = parseInt(options.limit, 10) || 40;
    const page = parseInt(options.page, 10) || 1;

    let feeds = [];
    if (scope === 'world') {
      // Hindi World News
      feeds = [
        'https://news.google.com/rss/headlines/section/topic/WORLD?hl=hi&gl=IN&ceid=IN:hi',
        'https://feeds.bbci.co.uk/hindi/rss.xml'
      ];
    } else if (scope === 'india' || scope === 'national') {
      // Hindi National News
      feeds = [
        'https://news.google.com/rss/headlines/section/topic/NATION?hl=hi&gl=IN&ceid=IN:hi',
        'https://feeds.feedburner.com/ndtvkhabar'
      ];
    } else {
      // All Hindi News (India + World + Tech + Sports + Entertainment)
      feeds = [
        'https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi',
        'https://news.google.com/rss/headlines/section/topic/WORLD?hl=hi&gl=IN&ceid=IN:hi',
        'https://feeds.bbci.co.uk/hindi/rss.xml',
        'https://feeds.feedburner.com/ndtvkhabar'
      ];
    }

    try {
      const responses = await Promise.allSettled(
        feeds.map(url => axios.get(url, { timeout: 3500, headers: { 'User-Agent': 'Mozilla/5.0' } }))
      );

      let allArticles = [];
      responses.forEach(res => {
        if (res.status === 'fulfilled' && res.value?.data) {
          const parsed = this.parseRSS(res.value.data, 'general', scope === 'world' ? 'global' : 'india', 'hi');
          allArticles = [...allArticles, ...parsed];
        }
      });

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
        language: 'hi',
        scope,
        totalResults: unique.length,
        page,
        limit,
        articles: paginated
      };
    } catch (err) {
      console.warn(`[RSSProvider] Hindi news fetch failed: ${err.message}`);
      return null;
    }
  }

  async getCategoryNews(category, options = {}) {
    const region = options.region || 'india';
    const language = options.lang || (region === 'hindi' ? 'hi' : 'en');
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
    let locale = 'hl=en-IN&gl=IN&ceid=IN:en';
    if (language === 'hi' || region === 'hindi') {
      locale = 'hl=hi&gl=IN&ceid=IN:hi';
    } else if (region === 'global') {
      locale = 'hl=en-US&gl=US&ceid=US:en';
    }

    const feedUrls = [];
    if (topic === 'TOP') {
      feedUrls.push(`https://news.google.com/rss?${locale}`);
    } else {
      feedUrls.push(`https://news.google.com/rss/headlines/section/topic/${topic}?${locale}`);
    }

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
          const parsed = this.parseRSS(res.value.data, cat, region === 'hindi' ? 'india' : region, language);
          allArticles = [...allArticles, ...parsed];
        }
      });

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
        language,
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
    const language = options.lang || (region === 'hindi' ? 'hi' : 'en');
    const limit = parseInt(options.limit, 10) || 40;
    const page = parseInt(options.page, 10) || 1;

    let locale = 'hl=en-IN&gl=IN&ceid=IN:en';
    if (language === 'hi' || region === 'hindi') {
      locale = 'hl=hi&gl=IN&ceid=IN:hi';
    } else if (region === 'global') {
      locale = 'hl=en-US&gl=US&ceid=US:en';
    }

    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&${locale}`;

    try {
      const response = await axios.get(feedUrl, {
        timeout: 4000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const parsed = this.parseRSS(response.data, options.category || 'general', region, language);
      const startIndex = (page - 1) * limit;
      const paginated = parsed.slice(startIndex, startIndex + limit);

      return {
        provider: this.name,
        query,
        region,
        language,
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
