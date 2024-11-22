const mongoose = require('mongoose');
const RatingReview = require('../models/ratingReviewModel');
const Movie = require('../models/movieModel');

exports.createRatingReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const { movieId } = req.params;
    const userId = req.user.id;

    const newRatingReview = await RatingReview.create({
      user: userId,
      movie: movieId,
      rating,
      review
    });

    await updateMovieAverageRating(movieId);

    res.status(201).json({
      status: 'success',
      data: {
        ratingReview: newRatingReview
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.updateRatingReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const userId = req.user.id;
    const { movieId } = req.params;

    const updatedRatingReview = await RatingReview.findOneAndUpdate(
      { user: userId, movie: movieId },
      { rating, review },
      { new: true, runValidators: true }
    );

    if (!updatedRatingReview) {
      return res.status(404).json({
        status: 'fail',
        message: 'Rating/Review not found'
      });
    }

    await updateMovieAverageRating(movieId);

    res.status(200).json({
      status: 'success',
      data: {
        ratingReview: updatedRatingReview
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getMovieRatingsReviews = async (req, res) => {
  try {
    const { movieId } = req.params;
    const ratingsReviews = await RatingReview.find({ movie: movieId })
      .populate('user', 'username')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: ratingsReviews.length,
      data: {
        ratingsReviews
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getReviewHighlights = async (req, res) => {
  try {
    const { movieId } = req.params;
    const highlights = await RatingReview.find({ movie: movieId, isHighlighted: true })
      .populate('user', 'username')
      .sort('-likes -createdAt')
      .limit(5);

    res.status(200).json({
      status: 'success',
      results: highlights.length,
      data: {
        highlights
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.reportReview = async (req, res) => {
  try {
    const review = await RatingReview.findByIdAndUpdate(
      req.params.id,
      { reported: true },
      { new: true }
    );
    
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review reported successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
  
async function updateMovieAverageRating(movieId) {
  const aggregateResult = await RatingReview.aggregate([
    { $match: { movie: new mongoose.Types.ObjectId(movieId) } },
    { $group: { _id: '$movie', averageRating: { $avg: '$rating' } } }
  ]);

  if (aggregateResult.length > 0) {
    await Movie.findByIdAndUpdate(movieId, {
      averageRating: aggregateResult[0].averageRating
    });
  }
}