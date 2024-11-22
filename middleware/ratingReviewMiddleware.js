const RatingReview = require('../models/ratingReviewModel');

exports.checkExistingRatingReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    const existingRatingReview = await RatingReview.findOne({ user: userId, movie: movieId });

    if (existingRatingReview && req.method === 'POST') {
      return res.status(400).json({
        status: 'fail',
        message: 'You have already rated/reviewed this movie. Use PUT to update.'
      });
    }

    if (!existingRatingReview && req.method === 'PUT') {
      return res.status(404).json({
        status: 'fail',
        message: 'You have not rated/reviewed this movie yet. Use POST to create a new rating/review.'
      });
    }

    next();
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};