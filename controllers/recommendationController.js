const Movie = require('../models/movieModel');
const User = require('../models/userModel');
const Rating = require('../models/ratingReviewModel');
const Recommendation = require('../models/recommendationModel');

const generateRecommendations = async (userId) => {
  try {
    // Get user preferences
    const user = await User.findById(userId);
    const userRatings = await Rating.find({ userId });
    
    // Get genre-based recommendations
    const genreBasedMovies = await Movie.find({
      genre: { $in: user.preferences.favoriteGenres },
      _id: { $nin: userRatings.map(r => r.movieId) }
    })
    .sort({ averageRating: -1 })
    .limit(10);

    // Create recommendations
    await Promise.all(genreBasedMovies.map(movie => 
      Recommendation.create({
        userId,
        movieId: movie._id,
        score: 0.8,
        type: 'genre-based'
      })
    ));

    return { success: true, message: 'Recommendations generated successfully' };
  } catch (error) {
    throw new Error('Error generating recommendations: ' + error.message);
  }
};

const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get existing recommendations or generate new ones
    let recommendations = await Recommendation.find({ userId })
      .populate('movieId', 'title genre director releaseYear averageRating posterUrl')
      .sort({ score: -1 })
      .limit(10);

    if (recommendations.length === 0) {
      await generateRecommendations(userId);
      recommendations = await Recommendation.find({ userId })
        .populate('movieId', 'title genre director releaseYear averageRating posterUrl')
        .sort({ score: -1 })
        .limit(10);
    }

    const limitedRecommendations = recommendations.map(rec => ({
      movieId: rec.movieId._id,
      title: rec.movieId.title,
      genre: rec.movieId.genre,
      director: rec.movieId.director,
      releaseYear: rec.movieId.releaseYear,
      averageRating: rec.movieId.averageRating,
      posterUrl: rec.movieId.posterUrl,
      score: rec.score,
      type: rec.type
    }));

    res.json(limitedRecommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSimilarMovies = async (req, res) => {
  try {
    const { movieId } = req.params;
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const similarMovies = await Movie.find({
      _id: { $ne: movieId },
      genre: { $in: movie.genre }
    })
    .select('title genre director releaseYear averageRating posterUrl')
    .sort({ averageRating: -1 })
    .limit(5);

    if (similarMovies.length === 0) {
      console.log(`No similar movies found for movie ID: ${movieId}`);
      console.log(`Movie genres: ${movie.genre}`);
    }

    res.json(similarMovies);
  } catch (error) {
    console.error('Error in getSimilarMovies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTopRatedMovies = async (req, res) => {
  try {
    const topRatedMovies = await Movie.find({
      averageRating: { $gt: 0 }
    })
    .select('title genre director releaseYear averageRating posterUrl totalRatings')
    .sort({ averageRating: -1 })
    .limit(5);

    res.json(topRatedMovies);
  } catch (error) {
    console.error('Error in getTopRatedMovies:', error);
    res.status(500).json({ error: error.message });
  }
};

const getTrendingMovies = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const trendingMovies = await Rating.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$movieId',
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      },
      {
        $sort: { totalRatings: -1, averageRating: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movieDetails'
        }
      },
      {
        $unwind: '$movieDetails'
      },
      {
        $project: {
          _id: 1,
          title: '$movieDetails.title',
          genre: '$movieDetails.genre',
          director: '$movieDetails.director',
          releaseYear: '$movieDetails.releaseYear',
          averageRating: 1,
          totalRatings: 1,
          posterUrl: '$movieDetails.posterUrl'
        }
      }
    ]);

    if (trendingMovies.length === 0) {
      // If no trending movies in the last 30 days, get the top 5 rated movies overall
      const topRatedMovies = await Movie.find()
        .sort({ averageRating: -1, totalRatings: -1 })
        .limit(5)
        .select('title genre director releaseYear averageRating posterUrl totalRatings');
      
      return res.json(topRatedMovies);
    }

    res.json(trendingMovies);
  } catch (error) {
    console.error('Error in getTrendingMovies:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateRecommendations,
  getPersonalizedRecommendations,
  getSimilarMovies,
  getTrendingMovies,
  getTopRatedMovies
};