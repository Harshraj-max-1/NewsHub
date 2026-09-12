const express = require('express');
const router = express.Router();
const {
  getBookmarks,
  getBookmarkIds,
  addBookmark,
  removeBookmark
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

router.use(protect); // All bookmark routes require authentication

router.get('/', getBookmarks);
router.get('/ids', getBookmarkIds);
router.post('/', addBookmark);
router.delete('/:articleId', removeBookmark);

module.exports = router;
