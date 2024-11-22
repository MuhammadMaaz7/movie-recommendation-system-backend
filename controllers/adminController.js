// controllers/adminController.js
const Movie = require('../models/movieModel');
const User = require('../models/userModel');
const Review = require('../models/ratingReviewModel');
const Discussion = require('../models/discussionModel');
const Statistics = require('../models/statisticsModel');

// Movie Management
exports.getAllMovies = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { title: new RegExp(search, 'i') } : {};
    
    const movies = await Movie.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Movie.countDocuments(query);
    
    res.json({
      movies,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    
    // Delete associated reviews
    await Review.deleteMany({ movie: req.params.id });
    
    res.json({ message: 'Movie and associated reviews deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Review Moderation
exports.getReportedReviews = async (req, res) => {
    try {
      const reviews = await Review.find({ reported: true })
        .populate('user', 'name email')
        .populate('movie', 'title')
        .sort('-createdAt');
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

  exports.moderateReview = async (req, res) => {
    try {
      const { action } = req.body; // 'remove' or 'approve'
      const review = await Review.findById(req.params.id);
      
      if (!review) return res.status(404).json({ message: 'Review not found' });
      
      if (action === 'remove') {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: 'Review removed successfully' });
      } else if (action === 'approve') {
        await Review.findByIdAndUpdate(req.params.id, 
          { reported: false },
          { new: true }
        );
        res.json({ message: 'Review approved successfully' });
      } else {
        res.status(400).json({ message: 'Invalid action' });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
// Statistics and Analytics
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's statistics
    let stats = await Statistics.findOne({ date: today })
      .populate('movieViews.movieId', 'title');
    
    if (!stats) {
      stats = new Statistics({ date: today });
      await stats.save();
    }
    
    // Get additional metrics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastActivity: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    const topMovies = await Movie.aggregate([
      { $sort: { viewCount: -1 } },
      { $limit: 10 },
      { $project: { title: 1, viewCount: 1, averageRating: 1 } }
    ]);
    
    const topGenres = await Movie.aggregate([
      { $unwind: '$genres' },
      { $group: { _id: '$genres', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      dailyStats: stats,
      totalUsers,
      activeUsers,
      topMovies,
      topGenres
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEngagementMetrics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Get daily stats for the last 30 days
    const dailyStats = await Statistics.find({
      date: { $gte: thirtyDaysAgo }
    }).sort('date');
    
    // Get user activity patterns
    const userActivityByHour = await User.aggregate([
      {
        $match: {
          lastActivity: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $hour: '$lastActivity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Get review distribution
    const reviewDistribution = await Review.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json({
      dailyStats,
      userActivityByHour,
      reviewDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Analytics Tracking Middleware
exports.trackMovieView = async (movieId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await Statistics.findOneAndUpdate(
      { date: today },
      {
        $inc: {
          [`movieViews.$[elem].count`]: 1
        }
      },
      {
        arrayFilters: [{ 'elem.movieId': movieId }],
        upsert: true
      }
    );
  } catch (error) {
    console.error('Error tracking movie view:', error);
  }
};

exports.trackActorSearch = async (actorName) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await Statistics.findOneAndUpdate(
      { date: today },
      {
        $inc: {
          [`actorSearches.$[elem].count`]: 1
        }
      },
      {
        arrayFilters: [{ 'elem.actorName': actorName }],
        upsert: true
      }
    );
  } catch (error) {
    console.error('Error tracking actor search:', error);
  }
};