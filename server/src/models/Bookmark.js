const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    articleId: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
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
      required: true,
      default: 'NewsHub'
    },
    sourceUrl: {
      type: String,
      default: ''
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
    publishedAt: {
      type: Date,
      default: Date.now
    },
    savedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index to prevent duplicate bookmarks per user
bookmarkSchema.index({ userId: 1, articleId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
