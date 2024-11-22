// routes/articleRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { 
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle
} = require('../controllers/articleController');

// Routes
router.post('/', auth, createArticle);
router.get('/', getArticles);
router.get('/:id', getArticleById);
router.put('/:id', auth, updateArticle);
router.delete('/:id', auth, deleteArticle);

module.exports = router;