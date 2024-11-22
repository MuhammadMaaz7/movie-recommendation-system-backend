// routes/ratingReviewRoutes.js
const express = require('express');
const ratingReviewController = require('../controllers/ratingReviewController');
const authMiddleware = require('../middleware/authMiddleware');
const ratingReviewMiddleware = require('../middleware/ratingReviewMiddleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

router.post(
  '/:movieId',
  ratingReviewMiddleware.checkExistingRatingReview,
  ratingReviewController.createRatingReview
);

router.put(
  '/:movieId',
  ratingReviewMiddleware.checkExistingRatingReview,
  ratingReviewController.updateRatingReview
);

router.get('/:movieId', ratingReviewController.getMovieRatingsReviews);

router.get('/:movieId/highlights', ratingReviewController.getReviewHighlights);

router.post('/:id/report', ratingReviewController.reportReview);

module.exports = router;