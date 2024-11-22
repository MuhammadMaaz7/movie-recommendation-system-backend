const Movie = require('../models/movieModel');

// Helper function to format movie data
const formatMovieResponse = (movie) => {
  if (!movie) return null;
  return {
    id: movie._id,
    title: movie.title,
    releaseDate: movie.releaseDate,
    averageRating: movie.averageRating,
    genre: movie.genre,
    director: movie.director
  };
};

const movieController = {
  // Get all movies
  getMovies: async (req, res) => {
    try {
      const movies = await Movie.find();
      const formattedMovies = movies.map(formatMovieResponse);
      res.json({ success: true, data: formattedMovies });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Get a single movie
  getMovie: async (req, res) => {
    try {
      const movie = await Movie.findById(req.params.id);
      if (!movie) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }
      res.json({ success: true, data: formatMovieResponse(movie) });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Create a new movie
  createMovie: async (req, res) => {
    try {
      const movie = await Movie.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Movie created successfully',
        data: formatMovieResponse(movie)
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Update a movie
  updateMovie: async (req, res) => {
    try {
      const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!movie) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }
      res.json({
        success: true,
        message: 'Movie updated successfully',
        data: formatMovieResponse(movie)
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Delete a movie
  deleteMovie: async (req, res) => {
    try {
      const movie = await Movie.findByIdAndDelete(req.params.id);
      if (!movie) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }
      res.json({ success: true, message: 'Movie deleted successfully' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Search and filter movies
  searchMovies: async (req, res) => {
    try {
      const {
        query,
        genre,
        director,
        actor,
        minRating,
        maxRating,
        minYear,
        maxYear,
        decade,
        country,
        language,
        keyword,
        sortBy,
        page = 1,
        limit = 10
      } = req.query;

      let filter = {};

      if (query) filter.$text = { $search: query };
      if (genre) filter.genre = genre;
      if (director) filter.director = { $regex: director, $options: 'i' };
      if (actor) filter.cast = { $regex: actor, $options: 'i' };
      if (minRating) filter.averageRating = { $gte: parseFloat(minRating) };
      if (maxRating) filter.averageRating = { ...filter.averageRating, $lte: parseFloat(maxRating) };
      if (minYear) filter.releaseDate = { $gte: new Date(minYear, 0, 1) };
      if (maxYear) filter.releaseDate = { ...filter.releaseDate, $lte: new Date(maxYear, 11, 31) };
      if (decade) filter.releaseDecade = parseInt(decade);
      if (country) filter.countryOfOrigin = country;
      if (language) filter.language = language;
      if (keyword) filter.keywords = keyword;

      let sort = {};
      if (sortBy) {
        const [field, order] = sortBy.split(':');
        sort[field] = order === 'desc' ? -1 : 1;
      } else {
        sort = { popularity: -1 };
      }

      const movies = await Movie.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Movie.countDocuments(filter);

      res.json({
        success: true,
        data: movies.map(formatMovieResponse),
        meta: {
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Get top movies
  getTopMovies: async (req, res) => {
    try {
      const { type, genre, limit = 10 } = req.query;
      let filter = {};
      let sort = { averageRating: -1 };

      if (genre) filter.genre = genre;
      if (type === 'month') {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        filter.releaseDate = { $gte: lastMonth };
      }

      const movies = await Movie.find(filter)
        .sort(sort)
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: movies.map(formatMovieResponse)
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Get movies by decade
  getMoviesByDecade: async (req, res) => {
    try {
      const { decade, page = 1, limit = 10 } = req.query;

      const filter = { releaseDecade: parseInt(decade) };

      const movies = await Movie.find(filter)
        .sort({ averageRating: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Movie.countDocuments(filter);

      res.json({
        success: true,
        data: movies.map(formatMovieResponse),
        meta: {
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  updateMovieBoxOffice : async (req, res) => {
    try {
      const movie = await Movie.findByIdAndUpdate(req.params.id,
        { boxOffice: req.body.boxOffice },
        { new: true, runValidators: true }
      );
      if (!movie) return res.status(404).json({ message: 'Movie not found' });
      res.json(movie);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  
  addMovieAward : async (req, res) => {
    try {
      const movie = await Movie.findById(req.params.id);
      if (!movie) return res.status(404).json({ message: 'Movie not found' });
      movie.awards.push(req.body);
      await movie.save();
      res.json(movie);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  removeMovieAward: async (req, res) => {
    try {
      const movie = await Movie.findById(req.params.id);
      if (!movie) return res.status(404).json({ message: 'Movie not found' });
      
      movie.awards = movie.awards.filter(award => award._id.toString() !== req.params.awardId);
      await movie.save();
      res.json(movie);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};



module.exports = movieController;