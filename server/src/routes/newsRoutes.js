const express = require('express');
const router = express.Router();
const {
  getTopHeadlines,
  getLatestNews,
  getCategoryNews,
  searchNews,
  getPersonalizedFeed,
  getTrendingNews,
  getArticleById,
  getSources,
  getHindiNews
} = require('../controllers/newsController');
const { optionalAuth } = require('../middleware/auth');

router.get('/top', getTopHeadlines);
router.get('/latest', getLatestNews);
router.get('/trending', getTrendingNews);
router.get('/hindi', getHindiNews);
router.get('/sources', getSources);
router.get('/personalized', optionalAuth, getPersonalizedFeed);
router.get('/search', searchNews);
router.get('/category/:category', getCategoryNews);
router.get('/:id', optionalAuth, getArticleById);

module.exports = router;
