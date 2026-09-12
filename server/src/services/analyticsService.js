const ReadingHistory = require('../models/ReadingHistory');
const Bookmark = require('../models/Bookmark');
const User = require('../models/User');

class AnalyticsService {
  async getUserAnalytics(userId) {
    const [totalRead, totalBookmarks, user] = await Promise.all([
      ReadingHistory.countDocuments({ userId }),
      Bookmark.countDocuments({ userId }),
      User.findById(userId).lean()
    ]);

    // Category breakdown
    const categoryAgg = await ReadingHistory.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const categoryDistribution = categoryAgg.map(item => ({
      name: (item._id || 'general').toUpperCase(),
      value: item.count
    }));

    // Weekly activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const historyRecent = await ReadingHistory.find({
      userId,
      openedAt: { $gte: sevenDaysAgo }
    }).lean();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activityMap = {};

    // Initialize past 7 days in order
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      activityMap[dayName] = 0;
    }

    historyRecent.forEach(entry => {
      const dayName = days[new Date(entry.openedAt).getDay()];
      if (activityMap[dayName] !== undefined) {
        activityMap[dayName]++;
      }
    });

    const weeklyActivity = Object.keys(activityMap).map(day => ({
      day,
      articles: activityMap[day]
    }));

    return {
      stats: {
        articlesRead: totalRead,
        bookmarksCount: totalBookmarks,
        favoriteTopicsCount: user?.interests?.length || 0,
        estimatedReadingMinutes: totalRead * 3
      },
      userInterests: user?.interests || [],
      weeklyActivity,
      categoryDistribution: categoryDistribution.length > 0 ? categoryDistribution : [
        { name: 'TECHNOLOGY', value: 4 },
        { name: 'AI', value: 3 },
        { name: 'BUSINESS', value: 2 }
      ]
    };
  }
}

module.exports = new AnalyticsService();
