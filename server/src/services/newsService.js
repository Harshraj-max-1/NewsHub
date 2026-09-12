const config = require('../config/env');
const cache = require('../config/cache');
const FallbackNewsProvider = require('./newsProviders/fallbackProvider');
const GNewsProvider = require('./newsProviders/gnewsProvider');
const NewsApiProvider = require('./newsProviders/newsApiProvider');

class NewsService {
  constructor() {
    this.fallbackProvider = new FallbackNewsProvider();
    this.gnewsProvider = new GNewsProvider(config.newsApiKeys.gnews);
    this.newsApiProvider = new NewsApiProvider(config.newsApiKeys.newsApi);
    this.cacheTtl = config.cacheTtl;
  }

  getActiveProviders() {
    const list = [];
    if (this.gnewsProvider.isConfigured()) list.push(this.gnewsProvider);
    if (this.newsApiProvider.isConfigured()) list.push(this.newsApiProvider);
    list.push(this.fallbackProvider);
    return list;
  }

  async getTopHeadlines(options = {}) {
    const region = options.region || 'india'; // Default to India edition
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
          cache.set(cacheKey, result, this.cacheTtl);
          return { ...result, cached: false };
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
          cache.set(cacheKey, result, this.cacheTtl);
          return { ...result, cached: false };
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
          cache.set(cacheKey, result, Math.floor(this.cacheTtl / 2));
          return { ...result, cached: false };
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
    const article = await this.fallbackProvider.getArticleById(id);
    if (article) return article;

    const all = await this.fallbackProvider.getTopHeadlines({ limit: 100, region: 'all' });
    return all.articles.find(a => a.id === id || a.externalId === id) || null;
  }

  async getAllAvailableArticles(region = 'all') {
    const result = await this.fallbackProvider.getTopHeadlines({ limit: 100, region });
    return result.articles || [];
  }
}

module.exports = new NewsService();
