const express = require('express');
const router = express.Router();
const {
  getHistory,
  recordHistory,
  clearHistory,
  deleteHistoryItem
} = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

router.use(protect); // All history routes require authentication

router.get('/', getHistory);
router.post('/', recordHistory);
router.delete('/', clearHistory);
router.delete('/:id', deleteHistoryItem);

module.exports = router;
