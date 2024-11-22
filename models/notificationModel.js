const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['RELEASE', 'TRAILER'],
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for querying notifications efficiently
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ releaseDate: 1, notificationSent: 1 });

module.exports = mongoose.model('Notification', notificationSchema);