// models/articleModel.js
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  publishDate: { type: Date, default: Date.now },
  category: { type: String, enum: ['movie', 'actor', 'industry'], required: true },
  tags: [{ type: String }],
  relatedMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  relatedActors: [{ type: String }],
  imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);