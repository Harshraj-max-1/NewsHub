const axios = require('axios');
const BaseNewsProvider = require('./baseProvider');
const { normalizeArticle } = require('../../utils/normalizer');

class NewsApiProvider extends BaseNewsProvider {
  constructor(apiKey) {
    super('NewsAPI');
    this.apiKey = apiKey;
    this.baseUrl = 'https://newsapi.org/v2';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async getTopHeadlines(options = {}) {
    if (!this.isConfigured()) return null;
    const category = options.category || 'general';
    const country = options.country || 'us';
    const pageSize = options.limit || 20;
    const page = options.page || 1;

    const response = await axios.get(`${this.baseUrl}/top-headlines`, {
      params: {
        category: category === 'all' ? undefined : category,
        country,
        pageSize,
        page,
        apiKey: this.apiKey
      },
      timeout: 6000
    });

    const articles = (response.data.articles || [])
      .filter(a => a.title && a.title !== '[Removed]')
      .map(a =>
        normalizeArticle({
          title: a.title,
          description: a.description,
          content: a.content,
          imageUrl: a.urlToImage,
          sourceName: a.source?.name,
          articleUrl: a.url,
          author: a.author,
          publishedAt: a.publishedAt,
          category
        })
      );

    return {
      provider: this.name,
      totalResults: response.data.totalResults || articles.length,
      articles
    };
  }

  async getCategoryNews(category, options = {}) {
    return this.getTopHeadlines({ ...options, category });
  }

  async searchNews(query, options = {}) {
    if (!this.isConfigured()) return null;
    const pageSize = options.limit || 20;
    const page = options.page || 1;
    const sortBy = options.sortBy || 'publishedAt';

    const response = await axios.get(`${this.baseUrl}/everything`, {
      params: {
        q: query,
        pageSize,
        page,
        sortBy,
        language: 'en',
        apiKey: this.apiKey
      },
      timeout: 6000
    });

    const articles = (response.data.articles || [])
      .filter(a => a.title && a.title !== '[Removed]')
      .map(a =>
        normalizeArticle({
          title: a.title,
          description: a.description,
          content: a.content,
          imageUrl: a.urlToImage,
          sourceName: a.source?.name,
          articleUrl: a.url,
          author: a.author,
          publishedAt: a.publishedAt,
          category: options.category || 'general'
        })
      );

    return {
      provider: this.name,
      totalResults: response.data.totalResults || articles.length,
      articles
    };
  }
}

module.exports = NewsApiProvider;
