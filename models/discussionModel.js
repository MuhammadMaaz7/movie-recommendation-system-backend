// models/discussionModel.js
const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['general', 'movie', 'actor', 'genre'], required: true },
  tags: [{ type: String }],
  relatedMovie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  relatedActor: { type: String },
  relatedGenre: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  comments: [{
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['active', 'closed', 'reported'], default: 'active' }
}, { timestamps: true });

// Add indexes for better query performance
discussionSchema.index({ category: 1, createdAt: -1 });
discussionSchema.index({ tags: 1 });
discussionSchema.index({ relatedMovie: 1 });

module.exports = mongoose.model('Discussion', discussionSchema);
