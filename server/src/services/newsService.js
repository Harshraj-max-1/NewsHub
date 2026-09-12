const config = require('../config/env');
const cache = require('../config/cache');
const FallbackNewsProvider = require('./newsProviders/fallbackProvider');
const RSSNewsProvider = require('./newsProviders/rssProvider');
const GNewsProvider = require('./newsProviders/gnewsProvider');
const NewsApiProvider = require('./newsProviders/newsApiProvider');

class NewsService {
  constructor() {
    this.fallbackProvider = new FallbackNewsProvider();
    this.rssProvider = new RSSNewsProvider();
    this.gnewsProvider = new GNewsProvider(config.newsApiKeys.gnews);
    this.newsApiProvider = new NewsApiProvider(config.newsApiKeys.newsApi);
    this.cacheTtl = config.cacheTtl;
  }

  getActiveProviders() {
    const list = [];
    if (this.gnewsProvider.isConfigured()) list.push(this.gnewsProvider);
    if (this.newsApiProvider.isConfigured()) list.push(this.newsApiProvider);
    list.push(this.rssProvider);
    list.push(this.fallbackProvider);
    return list;
  }

  async getTopHeadlines(options = {}) {
    const region = options.region || 'india';
    const category = options.category || 'all';
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.max(1, parseInt(options.limit, 10) || 12);

    const poolKey = `pool_top_${region}_${category}`;
    let pool = cache.get(poolKey);

    if (!pool || pool.length === 0) {
      const providers = this.getActiveProviders();
      for (const provider of providers) {
        try {
          const result = await provider.getTopHeadlines({ ...options, region, fetchAll: true, limit: 120 });
          if (result && result.articles && result.articles.length > 0) {
            pool = result.articles;
            if (pool.length < 15) {
              const fallback = await this.fallbackProvider.getTopHeadlines({ ...options, region, fetchAll: true, limit: 30 });
              pool = [...pool, ...(fallback.articles || [])];
            }
            pool = this.deduplicateArticles(pool);
            cache.set(poolKey, pool, this.cacheTtl);
            break;
          }
        } catch (err) {
          console.warn(`[NewsService] Provider ${provider.name} failed: ${err.message}. Trying next.`);
        }
      }

      if (!pool || pool.length === 0) {
        const fallback = await this.fallbackProvider.getTopHeadlines({ ...options, region, fetchAll: true, limit: 60 });
        pool = this.deduplicateArticles(fallback.articles || []);
        cache.set(poolKey, pool, this.cacheTtl);
      }
    }

    const totalResults = pool.length;
    const startIndex = (page - 1) * limit;
    const paginated = pool.slice(startIndex, startIndex + limit);

    return {
      provider: 'NewsHubSynthesis',
      region,
      totalResults,
      page,
      limit,
      articles: paginated
    };
  }

  async getCategoryNews(category, options = {}) {
    const region = options.region || 'all';
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.max(1, parseInt(options.limit, 10) || 12);

    const poolKey = `pool_cat_${region}_${category}`;
    let pool = cache.get(poolKey);

    if (!pool || pool.length === 0) {
      const providers = this.getActiveProviders();
      for (const provider of providers) {
        try {
          const result = await provider.getCategoryNews(category, { ...options, region, fetchAll: true, limit: 120 });
          if (result && result.articles && result.articles.length > 0) {
            pool = result.articles;
            if (pool.length < 15) {
              const fallback = await this.fallbackProvider.getCategoryNews(category, { ...options, region, fetchAll: true, limit: 30 });
              pool = [...pool, ...(fallback.articles || [])];
            }
            pool = this.deduplicateArticles(pool);
            cache.set(poolKey, pool, this.cacheTtl);
            break;
          }
        } catch (err) {
          console.warn(`[NewsService] Provider ${provider.name} failed for category ${category}: ${err.message}`);
        }
      }

      if (!pool || pool.length === 0) {
        const fallback = await this.fallbackProvider.getCategoryNews(category, { ...options, region, fetchAll: true, limit: 60 });
        pool = this.deduplicateArticles(fallback.articles || []);
        cache.set(poolKey, pool, this.cacheTtl);
      }
    }

    const totalResults = pool.length;
    const startIndex = (page - 1) * limit;
    const paginated = pool.slice(startIndex, startIndex + limit);

    return {
      provider: 'NewsHubSynthesis',
      category,
      region,
      totalResults,
      page,
      limit,
      articles: paginated
    };
  }

  async searchNews(query, options = {}) {
    const region = options.region || 'all';
    const cacheKey = `search_${encodeURIComponent(query)}_${region}_${options.category || ''}_${options.source || ''}_${options.sortBy || 'publishedAt'}_${options.page || 1}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const providers = this.getActiveProviders();
    for (const provider of providers) {
      try {
        const result = await provider.searchNews(query, { ...options, region });
        if (result && result.articles && result.articles.length > 0) {
          const fallback = await this.fallbackProvider.searchNews(query, { ...options, region });
          const combined = this.deduplicateArticles([...result.articles, ...(fallback.articles || [])]);

          const finalResult = {
            ...result,
            totalResults: combined.length,
            articles: combined.slice(((options.page || 1) - 1) * (options.limit || 20), (((options.page || 1) - 1) * (options.limit || 20)) + (options.limit || 20))
          };

          cache.set(cacheKey, finalResult, Math.floor(this.cacheTtl / 2));
          return { ...finalResult, cached: false };
        }
      } catch (err) {
        console.warn(`[NewsService] Search failed on provider ${provider.name}: ${err.message}`);
      }
    }

    const result = await this.fallbackProvider.searchNews(query, { ...options, region });
    cache.set(cacheKey, result, Math.floor(this.cacheTtl / 2));
    return { ...result, cached: false };
  }

  async getHindiNews(scope = 'all', options = {}) {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.max(1, parseInt(options.limit, 10) || 12);

    const poolKey = `pool_hindi_${scope}`;
    let pool = cache.get(poolKey);

    if (!pool || pool.length === 0) {
      try {
        const result = await this.rssProvider.getHindiNews(scope, { ...options, fetchAll: true, limit: 120 });
        if (result && result.articles && result.articles.length > 0) {
          pool = this.deduplicateArticles(result.articles);
          cache.set(poolKey, pool, this.cacheTtl);
        }
      } catch (err) {
        console.warn(`[NewsService] Hindi news fetch error: ${err.message}`);
      }

      if (!pool || pool.length === 0) {
        const fallback = await this.rssProvider.getTopHeadlines({ region: 'hindi', lang: 'hi', fetchAll: true, limit: 60 });
        pool = this.deduplicateArticles(fallback?.articles || []);
        cache.set(poolKey, pool, this.cacheTtl);
      }
    }

    const totalResults = pool.length;
    const startIndex = (page - 1) * limit;
    const paginated = pool.slice(startIndex, startIndex + limit);

    return {
      provider: 'NewsHubHindi',
      scope,
      language: 'hi',
      totalResults,
      page,
      limit,
      articles: paginated
    };
  }

  async getArticleById(id) {
    // 1. Check instant in-memory store
    const { getFromArticleStore } = require('../utils/normalizer');
    const fromStore = getFromArticleStore(id);
    if (fromStore) return fromStore;

    // 2. Check fallback provider
    const fallback = await this.fallbackProvider.getArticleById(id);
    if (fallback) return fallback;

    // 3. Search in all available English categories
    const all = await this.getAllAvailableArticles('all');
    let found = all.find(a => a.id === id || a.externalId === id);
    if (found) return found;

    // 4. Search in Hindi news feed
    try {
      const hindi = await this.rssProvider.getHindiNews('all', { limit: 100 });
      found = (hindi?.articles || []).find(a => a.id === id || a.externalId === id);
      if (found) return found;
    } catch (err) {}

    // 5. Search in top headlines
    try {
      const india = await this.rssProvider.getTopHeadlines({ region: 'india', limit: 80 });
      found = (india?.articles || []).find(a => a.id === id || a.externalId === id);
      if (found) return found;
    } catch (err) {}

    return null;
  }

  async getAllAvailableArticles(region = 'all') {
    const cacheKey = `all_available_pool_${region}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Fetch across top headlines and multiple major categories concurrently
    const categories = ['technology', 'ai', 'business', 'startups', 'science', 'sports', 'world'];
    const results = await Promise.allSettled([
      this.rssProvider.getTopHeadlines({ limit: 30, region }),
      ...categories.map(c => this.rssProvider.getCategoryNews(c, { limit: 15, region })),
      this.fallbackProvider.getTopHeadlines({ limit: 40, region })
    ]);

    let combined = [];
    results.forEach(r => {
      if (r.status === 'fulfilled' && r.value?.articles) {
        combined = [...combined, ...r.value.articles];
      }
    });

    const deduplicated = this.deduplicateArticles(combined);
    cache.set(cacheKey, deduplicated, 300); // 5 min cache
    return deduplicated;
  }

  deduplicateArticles(articles = []) {
    const seen = new Set();
    const result = [];

    for (const art of articles) {
      const key = (art.title || '').trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        result.push(art);
      }
    }

    // Sort strictly latest first so newest breaking dispatches appear on Page 1
    return result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
}

module.exports = new NewsService();
