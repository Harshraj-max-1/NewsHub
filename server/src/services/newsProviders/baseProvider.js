class BaseNewsProvider {
  constructor(name) {
    this.name = name;
  }

  async getTopHeadlines(options = {}) {
    throw new Error(`Method 'getTopHeadlines' not implemented on provider ${this.name}`);
  }

  async getCategoryNews(category, options = {}) {
    throw new Error(`Method 'getCategoryNews' not implemented on provider ${this.name}`);
  }

  async searchNews(query, options = {}) {
    throw new Error(`Method 'searchNews' not implemented on provider ${this.name}`);
  }

  async getArticleById(id) {
    throw new Error(`Method 'getArticleById' not implemented on provider ${this.name}`);
  }
}

module.exports = BaseNewsProvider;
