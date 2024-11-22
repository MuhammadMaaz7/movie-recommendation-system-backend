const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  setMovieReminder,
  getUserNotifications,
  markNotificationAsRead
} = require('../controllers/notificationController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/reminders', setMovieReminder);
router.get('/', getUserNotifications);
router.patch('/:notificationId/read', markNotificationAsRead);

module.exports = router;