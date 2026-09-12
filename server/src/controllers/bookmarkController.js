const Bookmark = require('../models/Bookmark');
const Interaction = require('../models/Interaction');

// @desc    Get user's bookmarked articles
// @route   GET /api/bookmarks
// @access  Private
exports.getBookmarks = async (req, res, next) => {
  try {
    const { category, q, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user._id };

    if (category && category !== 'all') {
      filter.category = category.toLowerCase();
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { sourceName: { $regex: q, $options: 'i' } }
      ];
    }

    const total = await Bookmark.countDocuments(filter);
    const bookmarks = await Bookmark.find(filter)
      .sort({ savedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .lean();

    res.status(200).json({
      success: true,
      totalResults: total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      data: bookmarks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookmarked article IDs for rapid state lookup
// @route   GET /api/bookmarks/ids
// @access  Private
exports.getBookmarkIds = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id }).select('articleId').lean();
    const ids = bookmarks.map(b => b.articleId);

    res.status(200).json({
      success: true,
      data: ids
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add article to bookmarks
// @route   POST /api/bookmarks
// @access  Private
exports.addBookmark = async (req, res, next) => {
  try {
    const {
      articleId,
      title,
      description,
      imageUrl,
      sourceName,
      sourceUrl,
      articleUrl,
      category,
      publishedAt
    } = req.body;

    if (!articleId || !title || !articleUrl) {
      return res.status(400).json({
        success: false,
        message: 'articleId, title, and articleUrl are required'
      });
    }

    const existing = await Bookmark.findOne({ userId: req.user._id, articleId });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Article is already bookmarked',
        data: existing
      });
    }

    const bookmark = await Bookmark.create({
      userId: req.user._id,
      articleId,
      title,
      description,
      imageUrl,
      sourceName: sourceName || 'NewsHub',
      sourceUrl,
      articleUrl,
      category: category || 'general',
      publishedAt: publishedAt || Date.now(),
      savedAt: Date.now()
    });

    // Log bookmark interaction
    Interaction.create({
      userId: req.user._id,
      articleId,
      action: 'bookmark',
      category: bookmark.category,
      sourceName: bookmark.sourceName
    }).catch(err => console.warn('[Bookmark Interaction Log]', err.message));

    res.status(201).json({
      success: true,
      message: 'Article saved to bookmarks',
      data: bookmark
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove article from bookmarks
// @route   DELETE /api/bookmarks/:articleId
// @access  Private
exports.removeBookmark = async (req, res, next) => {
  try {
    const { articleId } = req.params;

    const result = await Bookmark.findOneAndDelete({
      userId: req.user._id,
      articleId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Article removed from bookmarks',
      articleId
    });
  } catch (error) {
    next(error);
  }
};
