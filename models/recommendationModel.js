const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  type: {
    type: String,
    enum: ['genre-based', 'rating-based', 'similar-users'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Recommendations expire after 7 days
  }
});

// Index for quick lookups
recommendationSchema.index({ userId: 1, type: 1 });
recommendationSchema.index({ movieId: 1, score: -1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);        