const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    articleId: {
      type: String,
      required: true,
      index: true
    },
    action: {
      type: String,
      enum: ['view', 'bookmark', 'share', 'read_original'],
      required: true
    },
    category: {
      type: String,
      default: 'general'
    },
    sourceName: {
      type: String,
      default: 'NewsHub'
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

interactionSchema.index({ articleId: 1, action: 1 });
interactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Interaction', interactionSchema);
