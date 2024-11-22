// controllers/userController.js
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const generateToken = (id, isAdmin) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const userController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { username, email, password, isAdmin = false } = req.body;

      // Check if user already exists
      const userExists = await User.findOne({ $or: [{ email }, { username }] });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User with the provided email or username already exists'
        });
      }

      // Create new user
      const user = await User.create({
        username,
        email,
        password,
        isAdmin,
        preferences: {
          favoriteGenres: [],
          favoriteActors: [],
          favoriteDirectors: []
        }
      });

      // Generate JWT token
      const token = generateToken(user._id, user.isAdmin);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          preferences: user.preferences,
          token
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = generateToken(user._id, user.isAdmin);

      res.json({
        success: true,
        message: 'User logged in successfully',
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          preferences: user.preferences,
          token
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { preferences } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.preferences = preferences;
      await user.save();

      res.json({
        success: true,
        message: 'User profile updated successfully',
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          preferences: user.preferences
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Manage wishlist
  addToWishlist: async (req, res) => {
    try {
      const { movieId } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.wishlist.includes(movieId)) {
        user.wishlist.push(movieId);
        await user.save();
      }

      res.json({
        success: true,
        message: 'Movie added to wishlist successfully',
        data: user.wishlist
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  removeFromWishlist: async (req, res) => {
    try {
      const { movieId } = req.params;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.wishlist = user.wishlist.filter(id => id.toString() !== movieId);
      await user.save();

      res.json({
        success: true,
        message: 'Movie removed from wishlist successfully',
        data: user.wishlist
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = userController;