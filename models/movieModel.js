const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  genre: [{
    type: String,
    required: true,
    index: true
  }],
  director: {
    type: String,
    required: true,
    index: true
  },
  cast: {
    type: [String],
    required: true,
    index: true
  },
  releaseDate: {
    type: Date,
    required: true,
    index: true
  },
  releaseDecade: {
    type: Number,
    index: true
  },
  runtime: {
    type: Number,
    required: true
  },
  synopsis: {
    type: String,
    required: true
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10,
    index: true
  },
  popularity: {
    type: Number,
    default: 0,
    index: true
  },
  trivia: {
    type: [String]
  },
  goofs: {
    type: [String]
  },
  soundtrack: {
    type: [String]
  },
  ageRating: {
    type: String,
    required: true,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17']
  },
  parentalGuidance: {
    type: String
  },
  countryOfOrigin: {
    type: String,
    index: true
  },
  language: {
    type: String,
    index: true
  },
  keywords: [{
    type: String,
    index: true
  }],
  boxOffice: {
    openingWeekend: { type: Number, min: 0 },
    domestic: { type: Number, min: 0 },
    international: { type: Number, min: 0 },
    worldwide: { type: Number, min: 0 }
  },
  awards: [{
    name: { type: String },
    category: { type: String },
    year: { type: Number },
    won: { type: Boolean }
  }],
  }, {
  timestamps: true
});


movieSchema.pre('save', function(next) {
  if (this.boxOffice && this.boxOffice.domestic && this.boxOffice.international) {
    this.boxOffice.worldwide = this.boxOffice.domestic + this.boxOffice.international;
  }
  next();
});

// Create a text index for full-text search
movieSchema.index({ title: 'text', synopsis: 'text', keywords: 'text' });

// Pre-save middleware to set the releaseDecade
movieSchema.pre('save', function(next) {
  if (this.releaseDate) {
    this.releaseDecade = Math.floor(this.releaseDate.getFullYear() / 10) * 10;
  }
  next();
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;