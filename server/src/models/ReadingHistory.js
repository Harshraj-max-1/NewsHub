const mongoose = require('mongoose');

const readingHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    articleId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    sourceName: {
      type: String,
      default: 'NewsHub'
    },
    articleUrl: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: 'general',
      lowercase: true,
      index: true
    },
    openedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient user history retrieval sorted by openedAt
readingHistorySchema.index({ userId: 1, openedAt: -1 });

module.exports = mongoose.model('ReadingHistory', readingHistorySchema);
