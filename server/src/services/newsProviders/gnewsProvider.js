const axios = require('axios');
const BaseNewsProvider = require('./baseProvider');
const { normalizeArticle } = require('../../utils/normalizer');

class GNewsProvider extends BaseNewsProvider {
  constructor(apiKey) {
    super('GNews');
    this.apiKey = apiKey;
    this.baseUrl = 'https://gnews.io/api/v4';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async getTopHeadlines(options = {}) {
    if (!this.isConfigured()) return null;
    const category = options.category || 'general';
    const lang = options.lang || 'en';
    const max = options.limit || 20;

    const response = await axios.get(`${this.baseUrl}/top-headlines`, {
      params: {
        category,
        lang,
        max,
        apikey: this.apiKey
      },
      timeout: 6000
    });

    const articles = (response.data.articles || []).map(a =>
      normalizeArticle({
        title: a.title,
        description: a.description,
        content: a.content,
        imageUrl: a.image,
        sourceName: a.source?.name,
        sourceUrl: a.source?.url,
        articleUrl: a.url,
        publishedAt: a.publishedAt,
        category
      })
    );

    return {
      provider: this.name,
      totalResults: response.data.totalArticles || articles.length,
      articles
    };
  }

  async getCategoryNews(category, options = {}) {
    return this.getTopHeadlines({ ...options, category });
  }

  async searchNews(query, options = {}) {
    if (!this.isConfigured()) return null;
    const lang = options.lang || 'en';
    const max = options.limit || 20;

    const response = await axios.get(`${this.baseUrl}/search`, {
      params: {
        q: query,
        lang,
        max,
        apikey: this.apiKey
      },
      timeout: 6000
    });

    const articles = (response.data.articles || []).map(a =>
      normalizeArticle({
        title: a.title,
        description: a.description,
        content: a.content,
        imageUrl: a.image,
        sourceName: a.source?.name,
        sourceUrl: a.source?.url,
        articleUrl: a.url,
        publishedAt: a.publishedAt,
        category: options.category || 'general'
      })
    );

    return {
      provider: this.name,
      totalResults: response.data.totalArticles || articles.length,
      articles
    };
  }
}

module.exports = GNewsProvider;
