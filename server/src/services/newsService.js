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
    const page = options.page || 1;
    const limit = options.limit || 20;

    const cacheKey = `top_${region}_${category}_${page}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const providers = this.getActiveProviders();
    for (const provider of providers) {
      try {
        const result = await provider.getTopHeadlines({ ...options, region });
        if (result && result.articles && result.articles.length > 0) {
          // Merge with a few curated stories to guarantee rich images & details
          const fallback = await this.fallbackProvider.getTopHeadlines({ ...options, region });
          const combined = this.deduplicateArticles([...result.articles, ...(fallback.articles || [])]);
          
          const finalResult = {
            ...result,
            totalResults: combined.length,
            articles: combined.slice((page - 1) * limit, ((page - 1) * limit) + limit)
          };

          cache.set(cacheKey, finalResult, this.cacheTtl);
          return { ...finalResult, cached: false };
        }
      } catch (err) {
        console.warn(`[NewsService] Provider ${provider.name} failed: ${err.message}. Trying next.`);
      }
    }

    const result = await this.fallbackProvider.getTopHeadlines({ ...options, region });
    cache.set(cacheKey, result, this.cacheTtl);
    return { ...result, cached: false };
  }

  async getCategoryNews(category, options = {}) {
    const region = options.region || 'all';
    const page = options.page || 1;
    const limit = options.limit || 20;

    const cacheKey = `category_${region}_${category}_${page}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const providers = this.getActiveProviders();
    for (const provider of providers) {
      try {
        const result = await provider.getCategoryNews(category, { ...options, region });
        if (result && result.articles && result.articles.length > 0) {
          const fallback = await this.fallbackProvider.getCategoryNews(category, { ...options, region });
          const combined = this.deduplicateArticles([...result.articles, ...(fallback.articles || [])]);

          const finalResult = {
            ...result,
            totalResults: combined.length,
            articles: combined.slice((page - 1) * limit, ((page - 1) * limit) + limit)
          };

          cache.set(cacheKey, finalResult, this.cacheTtl);
          return { ...finalResult, cached: false };
        }
      } catch (err) {
        console.warn(`[NewsService] Provider ${provider.name} failed for category ${category}: ${err.message}`);
      }
    }

    const result = await this.fallbackProvider.getCategoryNews(category, { ...options, region });
    cache.set(cacheKey, result, this.cacheTtl);
    return { ...result, cached: false };
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

  async getArticleById(id) {
    const fallback = await this.fallbackProvider.getArticleById(id);
    if (fallback) return fallback;

    const all = await this.getAllAvailableArticles('all');
    return all.find(a => a.id === id || a.externalId === id) || null;
  }

  async getAllAvailableArticles(region = 'all') {
    const [liveResult, fallbackResult] = await Promise.allSettled([
      this.rssProvider.getTopHeadlines({ limit: 40, region }),
      this.fallbackProvider.getTopHeadlines({ limit: 40, region })
    ]);

    const liveArticles = liveResult.status === 'fulfilled' && liveResult.value ? liveResult.value.articles : [];
    const fallbackArticles = fallbackResult.status === 'fulfilled' && fallbackResult.value ? fallbackResult.value.articles : [];

    return this.deduplicateArticles([...liveArticles, ...fallbackArticles]);
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

    return result;
  }
}

module.exports = new NewsService();
