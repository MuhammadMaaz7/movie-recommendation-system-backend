const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getPersonalizedRecommendations,
  getSimilarMovies,
  getTrendingMovies,
  getTopRatedMovies
} = require('../controllers/recommendationController');

// Protected routes - require authentication
router.get('/personalized', auth, getPersonalizedRecommendations);
router.get('/similar/:movieId', getSimilarMovies);
router.get('/trending', getTrendingMovies);
router.get('/top-rated', getTopRatedMovies);

module.exports = router;