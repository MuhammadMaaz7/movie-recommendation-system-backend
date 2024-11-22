// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');
const {
  getAllMovies,
  updateMovie,
  deleteMovie,
  getReportedReviews,
  moderateReview,
  getDashboardStats,
  getEngagementMetrics,
  reportReview
} = require('../controllers/adminController');

// Movie Management
router.get('/movies', auth, adminMiddleware, getAllMovies);
router.put('/movies/:id', auth, adminMiddleware, updateMovie);
router.delete('/movies/:id', auth, adminMiddleware, deleteMovie);

// Review Moderation
router.get('/reviews/reported', auth, adminMiddleware, getReportedReviews);
router.post('/reviews/:id/moderate', auth, adminMiddleware, moderateReview);

// Statistics and Analytics
router.get('/dashboard', auth, adminMiddleware, getDashboardStats);
router.get('/engagement', auth, adminMiddleware, getEngagementMetrics);

module.exports = router;