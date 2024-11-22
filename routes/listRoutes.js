const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { validateListOwnership, validateListAccess } = require('../middleware/listMiddleware');
const {
  createList,
  getLists,
  getUserLists,
  updateList,
  deleteList,
  followList,
  unfollowList
} = require('../controllers/listController');

const router = express.Router();

// Public routes
router.get('/public', getLists);

// Protected routes
router.use(authMiddleware);

router.post('/', createList);
router.get('/my-lists', getUserLists);
router.put('/:id', validateListOwnership, updateList);
router.delete('/:id', validateListOwnership, deleteList);

// Follow/unfollow routes
router.post('/:id/follow', validateListAccess, followList);
router.post('/:id/unfollow', validateListAccess, unfollowList);

module.exports = router;