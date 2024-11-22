const Movie = require('../models/movieModel');

// Middleware to check if movie exists
exports.checkMovieExists = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    req.movie = movie;
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};