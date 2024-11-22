const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.use(auth);
router.put('/profile', userController.updateProfile);
router.post('/wishlist', userController.addToWishlist);
router.delete('/wishlist/:movieId', userController.removeFromWishlist);

module.exports = router;