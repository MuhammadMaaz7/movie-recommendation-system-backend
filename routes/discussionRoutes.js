// routes/discussionRoutes.js
const express = require('express');
const auth = require('../middleware/authMiddleware');
const router = express.Router();
const {
  createDiscussion,
  getDiscussions,
  getDiscussionById,
  addComment,
  likeDiscussion,
  likeComment
} = require('../controllers/discussionController');

router.post('/', auth, createDiscussion);
router.get('/', getDiscussions);
router.get('/:id', getDiscussionById);
router.post('/:id/comments', auth, addComment);
router.post('/:id/like', auth, likeDiscussion);
router.post('/:discussionId/comments/:commentId/like', auth, likeComment);

module.exports = router;