// models/statisticsModel.js
const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  movieViews: [{
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    count: { type: Number, default: 0 }
  }],
  genreViews: [{
    genre: { type: String },
    count: { type: Number, default: 0 }
  }],
  actorSearches: [{
    actorName: { type: String },
    count: { type: Number, default: 0 }
  }],
  userRegistrations: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalDiscussions: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Statistics', statisticsSchema);