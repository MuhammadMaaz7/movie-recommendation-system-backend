const mongoose = require('mongoose');

const ratingReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 1000 // Limit review to 1000 characters
  },
  likes: {
    type: Number,
    default: 0
  },
  isHighlighted: {
    type: Boolean,
    default: false
  },
  reported: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only rate/review a movie once
ratingReviewSchema.index({ user: 1, movie: 1 }, { unique: true });

const RatingReview = mongoose.model('RatingReview', ratingReviewSchema);

module.exports = RatingReview;