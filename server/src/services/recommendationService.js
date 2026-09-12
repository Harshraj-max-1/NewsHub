const newsService = require('./newsService');
const ReadingHistory = require('../models/ReadingHistory');
const Bookmark = require('../models/Bookmark');
const Interaction = require('../models/Interaction');

class RecommendationService {
  async getPersonalizedFeed(user, options = {}) {
    const userInterests = (user?.interests || ['technology', 'ai', 'business', 'startups']).map(i => i.toLowerCase());
    const preferredSources = (user?.preferredSources || []).map(s => s.toLowerCase());
    const userId = user?._id;
    const region = options.region || user?.defaultRegion || 'india'; // Default to India edition

    // Fetch candidate articles matching the selected regional scope
    const candidates = await newsService.getAllAvailableArticles(region);

    let categoryHistoryCounts = {};
    if (userId) {
      const recentHistory = await ReadingHistory.find({ userId })
        .sort({ openedAt: -1 })
        .limit(50)
        .lean();

      recentHistory.forEach(item => {
        const cat = (item.category || 'general').toLowerCase();
        categoryHistoryCounts[cat] = (categoryHistoryCounts[cat] || 0) + 1;
      });
    }

    const scoredArticles = candidates.map(article => {
      let interestScore = 0;
      let recencyScore = 0;
      let historyScore = 0;
      let sourceScore = 0;
      const reasons = [];

      const artCategory = (article.category || 'general').toLowerCase();
      const artTitle = (article.title || '').toLowerCase();
      const artSource = (article.sourceName || '').toLowerCase();

      // 1. Direct Interest Match (Max 50 pts)
      if (userInterests.includes(artCategory)) {
        interestScore = 50;
        reasons.push(`+50 Matched topic "${article.category.toUpperCase()}"`);
      } else {
        const matchedKeyword = userInterests.find(topic => artTitle.includes(topic));
        if (matchedKeyword) {
          interestScore = 30;
          reasons.push(`+30 Keyword match "${matchedKeyword}"`);
        }
      }

      // 2. Recency Score (Max 25 pts)
      const ageHours = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
      if (ageHours < 2) {
        recencyScore = 25;
        reasons.push(`+25 Fresh dispatch (<2h ago)`);
      } else if (ageHours < 6) {
        recencyScore = 20;
        reasons.push(`+20 Recent release (<6h ago)`);
      } else if (ageHours < 24) {
        recencyScore = 15;
        reasons.push(`+15 Published today`);
      } else {
        recencyScore = 5;
      }

      // 3. History Affinity Score (Max 15 pts)
      const historyCount = categoryHistoryCounts[artCategory] || 0;
      if (historyCount >= 5) {
        historyScore = 15;
        reasons.push(`+15 High reading habit in ${artCategory}`);
      } else if (historyCount >= 1) {
        historyScore = 10;
        reasons.push(`+10 Based on your reading history`);
      }

      // 4. Source Preference Score (Max 10 pts)
      if (preferredSources.some(src => artSource.includes(src))) {
        sourceScore = 10;
        reasons.push(`+10 Preferred publisher (${article.sourceName})`);
      }

      const totalScore = Math.min(100, Math.round(interestScore + recencyScore + historyScore + sourceScore));

      return {
        ...article,
        recommendation: {
          score: totalScore,
          breakdown: {
            interest: interestScore,
            recency: recencyScore,
            history: historyScore,
            source: sourceScore
          },
          reasons
        }
      };
    });

    // Sort descending by recommendation score
    scoredArticles.sort((a, b) => b.recommendation.score - a.recommendation.score);

    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    return {
      personalized: true,
      region,
      userInterests,
      totalResults: scoredArticles.length,
      page,
      limit,
      articles: scoredArticles.slice(startIndex, startIndex + limit)
    };
  }

  async getTrendingNews(limit = 10, region = 'india') {
    const candidates = await newsService.getAllAvailableArticles(region);

    const interactionCounts = await Interaction.aggregate([
      {
        $group: {
          _id: '$articleId',
          views: { $sum: { $cond: [{ $eq: ['$action', 'view'] }, 1, 0] } },
          bookmarks: { $sum: { $cond: [{ $eq: ['$action', 'bookmark'] }, 1, 0] } }
        }
      }
    ]);

    const countMap = new Map();
    interactionCounts.forEach(item => {
      countMap.set(item._id, item);
    });

    const trending = candidates.map(article => {
      const stats = countMap.get(article.id) || countMap.get(article.externalId) || { views: 0, bookmarks: 0 };
      const hoursSincePublish = Math.max(1, (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60));
      const recencyBoost = Math.max(1, Math.round(50 / Math.sqrt(hoursSincePublish)));
      const trendingScore = (stats.views * 2) + (stats.bookmarks * 5) + recencyBoost;

      return {
        ...article,
        trendingScore,
        viewCount: stats.views,
        bookmarkCount: stats.bookmarks
      };
    });

    trending.sort((a, b) => b.trendingScore - a.trendingScore);
    return trending.slice(0, limit);
  }
}

module.exports = new RecommendationService();
