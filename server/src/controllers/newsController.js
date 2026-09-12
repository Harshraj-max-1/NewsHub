const newsService = require('../services/newsService');
const recommendationService = require('../services/recommendationService');
const Interaction = require('../models/Interaction');

// @desc    Get top headlines (Supports region: 'india' | 'global' | 'all')
// @route   GET /api/news/top
// @access  Public
exports.getTopHeadlines = async (req, res, next) => {
  try {
    const { category, region, page, limit } = req.query;
    const data = await newsService.getTopHeadlines({ category, region, page, limit });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest news
// @route   GET /api/news/latest
// @access  Public
exports.getLatestNews = async (req, res, next) => {
  try {
    const { region, page, limit } = req.query;
    const data = await newsService.getTopHeadlines({ region, page, limit });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category news
// @route   GET /api/news/category/:category
// @access  Public
exports.getCategoryNews = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { region, page, limit } = req.query;
    const data = await newsService.getCategoryNews(category, { region, page, limit });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Hindi news (Supports scope: 'all' | 'india' | 'world')
// @route   GET /api/news/hindi
// @access  Public
exports.getHindiNews = async (req, res, next) => {
  try {
    const { scope, page, limit } = req.query;
    const data = await newsService.getHindiNews(scope, { page, limit });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search news with debounced filters
// @route   GET /api/news/search
// @access  Public
exports.searchNews = async (req, res, next) => {
  try {
    const { q, category, source, region, sortBy, page, limit } = req.query;
    
    if (!q && !category && !source && !region) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search term or filter'
      });
    }

    const data = await newsService.searchNews(q || '', {
      category,
      source,
      region: region || 'all',
      sortBy,
      page,
      limit
    });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized news feed
// @route   GET /api/news/personalized
// @access  Public (Enhanced if authenticated)
exports.getPersonalizedFeed = async (req, res, next) => {
  try {
    const { region, page, limit } = req.query;
    const user = req.user || null;

    const data = await recommendationService.getPersonalizedFeed(user, { region, page, limit });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending stories
// @route   GET /api/news/trending
// @access  Public
exports.getTrendingNews = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const region = req.query.region || 'india';
    const data = await recommendationService.getTrendingNews(limit, region);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get article by ID & log view interaction
// @route   GET /api/news/:id
// @access  Public
exports.getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await newsService.getArticleById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    Interaction.create({
      userId: req.user?._id,
      articleId: article.id || article.externalId,
      action: 'view',
      category: article.category,
      sourceName: article.sourceName
    }).catch(err => console.warn('[Interaction Log Error]', err.message));

    const categoryNews = await newsService.getCategoryNews(article.category, { limit: 4, region: 'all' });
    const related = (categoryNews.articles || []).filter(a => (a.id || a.externalId) !== (article.id || article.externalId)).slice(0, 3);

    res.status(200).json({
      success: true,
      data: {
        article,
        related
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of top publisher sources
// @route   GET /api/news/sources
// @access  Public
exports.getSources = async (req, res, next) => {
  try {
    const articles = await newsService.getAllAvailableArticles('all');
    const sourceMap = new Map();

    articles.forEach(a => {
      if (a.sourceName) {
        sourceMap.set(a.sourceName, {
          name: a.sourceName,
          category: a.category,
          region: a.region || 'india',
          url: a.sourceUrl,
          articleCount: (sourceMap.get(a.sourceName)?.articleCount || 0) + 1
        });
      }
    });

    const sources = Array.from(sourceMap.values()).sort((a, b) => b.articleCount - a.articleCount);

    res.status(200).json({
      success: true,
      data: sources
    });
  } catch (error) {
    next(error);
  }
};
