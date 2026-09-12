const ReadingHistory = require('../models/ReadingHistory');
const Interaction = require('../models/Interaction');

// @desc    Get reading history grouped by today, yesterday, earlier
// @route   GET /api/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;

    const total = await ReadingHistory.countDocuments({ userId: req.user._id });
    const items = await ReadingHistory.find({ userId: req.user._id })
      .sort({ openedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .lean();

    // Categorize into Today, Yesterday, Earlier for elegant editorial display
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    const groups = {
      today: [],
      yesterday: [],
      earlier: []
    };

    items.forEach(item => {
      const itemTime = new Date(item.openedAt).getTime();
      if (itemTime >= todayStart) {
        groups.today.push(item);
      } else if (itemTime >= yesterdayStart) {
        groups.yesterday.push(item);
      } else {
        groups.earlier.push(item);
      }
    });

    res.status(200).json({
      success: true,
      totalResults: total,
      data: items,
      grouped: groups
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record reading history entry
// @route   POST /api/history
// @access  Private
exports.recordHistory = async (req, res, next) => {
  try {
    const {
      articleId,
      title,
      description,
      imageUrl,
      sourceName,
      articleUrl,
      category
    } = req.body;

    if (!articleId || !title || !articleUrl) {
      return res.status(400).json({
        success: false,
        message: 'articleId, title, and articleUrl are required'
      });
    }

    // Upsert / refresh timestamp for reading history
    const existing = await ReadingHistory.findOne({ userId: req.user._id, articleId });
    let historyEntry;

    if (existing) {
      existing.openedAt = Date.now();
      historyEntry = await existing.save();
    } else {
      historyEntry = await ReadingHistory.create({
        userId: req.user._id,
        articleId,
        title,
        description,
        imageUrl,
        sourceName: sourceName || 'NewsHub',
        articleUrl,
        category: category || 'general',
        openedAt: Date.now()
      });
    }

    // Log interaction
    Interaction.create({
      userId: req.user._id,
      articleId,
      action: 'view',
      category: historyEntry.category,
      sourceName: historyEntry.sourceName
    }).catch(err => console.warn('[History Interaction Log]', err.message));

    res.status(201).json({
      success: true,
      data: historyEntry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all reading history
// @route   DELETE /api/history
// @access  Private
exports.clearHistory = async (req, res, next) => {
  try {
    await ReadingHistory.deleteMany({ userId: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Reading history successfully cleared'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single reading history item
// @route   DELETE /api/history/:id
// @access  Private
exports.deleteHistoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await ReadingHistory.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'History record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item removed from reading history'
    });
  } catch (error) {
    next(error);
  }
};
