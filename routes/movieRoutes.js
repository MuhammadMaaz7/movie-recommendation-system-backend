const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { checkMovieExists } = require('../middleware/movieMiddleware');
const { validateSearchParams } = require('../middleware/searchMiddleware');

const auth = require('../middleware/authMiddleware');

// Get all movies
router.get('/movies', movieController.getMovies);

// Get a single movie
router.get('/movies/:id', checkMovieExists, movieController.getMovie);

// Create a new movie
router.post('/movie', movieController.createMovie);

// Update a movie
router.put('/movie/:id', checkMovieExists, movieController.updateMovie);

// Delete a movie
router.delete('/movie/:id',auth, checkMovieExists, movieController.deleteMovie);

// Search and filter movies
router.get('/search', validateSearchParams, movieController.searchMovies);

// Get top movies
router.get('/top', movieController.getTopMovies);

// Get movies by decade
router.get('/decade', validateSearchParams, movieController.getMoviesByDecade);

router.use(auth)

router.patch('/movie/:id/box-office', movieController.updateMovieBoxOffice);

router.post('/movie/:id/awards',  movieController.addMovieAward);

router.delete('/movie/:id/awards/:awardId', movieController.removeMovieAward);

module.exports = router;