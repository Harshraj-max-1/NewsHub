const analyticsService = require('../services/analyticsService');

// @desc    Get reading dashboard analytics for user
// @route   GET /api/analytics
// @access  Private
exports.getAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getUserAnalytics(req.user._id);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
